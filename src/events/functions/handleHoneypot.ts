import { Client, codeBlock, Colors, GuildMember, Message, User } from 'discord.js';
import {
    banMember,
    constantsConfig,
    durationInEnglish,
    imageBaseUrl,
    Logger,
    makeEmbed,
    makeLines,
    ModerationActionResult,
    sendModLog,
    timeoutMember,
    unbanUser,
} from '../../lib';

type HoneypotConfig = NonNullable<typeof constantsConfig.honeypot>;

const MAX_MESSAGE_LENGTH = 1024;
const MAX_ERROR_LENGTH = 200;

const timeoutReason = 'Honeypot - Automatic timeout after posting in the honeypot channel';
const banReason = 'Honeypot - Automatic ban to remove the user and their recent messages';
const unbanReason = 'Honeypot - Automatic unban, the user may rejoin';

// Users with honeypot actions in progress: a spam burst arrives as several messages
const inFlight = new Set<string>();

interface HoneypotOutcome {
    timeout: ModerationActionResult;
    messageDeleted: boolean;
    dmSent: boolean;
    // Undefined for support members, they are only timed out
    ban?: ModerationActionResult;
    // Undefined when there was no ban or the ban failed, there is nothing to unban then
    unban?: ModerationActionResult;
}

const dmEmbed = (
    member: GuildMember,
    moderator: User,
    channelName: string,
    honeypot: HoneypotConfig,
    banned: boolean,
) =>
    makeEmbed({
        title: banned
            ? `You have been removed from ${member.guild.name}`
            : `You have been timed out in ${member.guild.name}`,
        description: makeLines([
            `You posted in #${channelName}, a channel that only exists to catch spam bots.`,
            '',
            ...(banned
                ? [
                      `Your messages of the last ${durationInEnglish(honeypot.deleteWindowSeconds * 1000)} were deleted and you were removed from the server.`,
                      `You may rejoin, but you will remain timed out for ${durationInEnglish(honeypot.timeoutDurationSeconds * 1000)}.`,
                  ]
                : [`You have been timed out for ${durationInEnglish(honeypot.timeoutDurationSeconds * 1000)}.`]),
            '',
            'If you believe this was a mistake, please contact the moderation team once you are able to post again.',
        ]),
        fields: [
            { inline: true, name: 'Moderator', value: moderator.toString() },
            { inline: false, name: 'Reason', value: timeoutReason },
        ],
        footer: {
            text: `Your timeout will be lifted on ${new Date(Date.now() + honeypot.timeoutDurationSeconds * 1000).toUTCString()}`,
        },
    });

const describeError = (error: unknown) => `${error}`.slice(0, MAX_ERROR_LENGTH);

const actionLine = (name: string, result: ModerationActionResult, applied: string) =>
    result.success ? `✅ ${applied}` : `❌ ${name}: ${describeError(result.error)}`;

const summaryEmbed = (message: Message<true>, honeypot: HoneypotConfig, outcome: HoneypotOutcome) => {
    const { author } = message;
    const { timeout, messageDeleted, dmSent, ban, unban } = outcome;

    let messageContent = message.content;
    let messageContentFieldTitle = 'Message Content';
    if (messageContent.length > MAX_MESSAGE_LENGTH) {
        messageContent = `${message.content.slice(0, MAX_MESSAGE_LENGTH - 11)}...`;
        messageContentFieldTitle = 'Message Content (truncated)';
    }

    const infractions = [timeout, ban, unban].flatMap((result) =>
        result?.success && result.infraction ? [result.infraction] : [],
    );
    const unsavedInfraction = infractions.find((infraction) => !infraction.saved);

    const banLines = ban
        ? [
              actionLine(
                  'Ban',
                  ban,
                  `Banned, messages of the last ${durationInEnglish(honeypot.deleteWindowSeconds * 1000)} deleted`,
              ),
              unban
                  ? actionLine('Unban', unban, 'Unbanned') + (unban.success ? '' : ' - the user is still banned')
                  : '⏭️ Unban skipped, the ban failed',
          ]
        : ['⏭️ Ban and unban skipped, the user is part of the support team'];

    const actions = [
        actionLine('Timeout', timeout, `Timed out for ${durationInEnglish(honeypot.timeoutDurationSeconds * 1000)}`),
        messageDeleted ? '✅ Message deleted' : '❌ Message not deleted',
        dmSent ? '✅ DM sent' : '❌ DM not sent, they either have DMs closed or share no mutual servers with the bot',
        ...banLines,
        unsavedInfraction && !unsavedInfraction.saved
            ? `❌ Infractions not logged (${unsavedInfraction.reason})`
            : '✅ Infractions logged',
    ];

    return makeEmbed({
        author: { name: `[HONEYPOT] ${author.tag}`, iconURL: author.displayAvatarURL() },
        thumbnail: { url: `${imageBaseUrl}/moderation/scam.png` },
        fields: [
            { name: 'User', value: author.toString(), inline: true },
            { name: 'Channel', value: message.channel.toString(), inline: true },
            { name: messageContentFieldTitle, value: codeBlock(messageContent || '(no text content)') },
            { name: 'Actions', value: makeLines(actions) },
        ],
        footer: { text: `User ID: ${author.id}` },
        color: Colors.Red,
    });
};

/**
 * Timeout first (Discord keeps it when the user rejoins), then, unless the member is part of the support team, ban
 * to remove the user and purge their recent messages and unban so a genuine user can rejoin. Every step runs even
 * if a previous one failed, except the unban.
 */
async function applyActions(
    message: Message<true>,
    member: GuildMember,
    moderator: User,
    honeypot: HoneypotConfig,
    shouldBan: boolean,
) {
    const { author, guild } = message;
    const logPrefix = `Honeypot - User ${author.id}`;
    Logger.info(
        `Honeypot - ${author.tag} (${author.id}) posted message ${message.id}, ${shouldBan ? 'starting softban' : 'timing out support member'}`,
    );

    const timeout = await timeoutMember({
        member,
        moderator,
        reason: timeoutReason,
        durationSeconds: honeypot.timeoutDurationSeconds,
        notifyUser: false,
    });

    let messageDeleted = true;
    try {
        await message.delete();
    } catch (error) {
        messageDeleted = false;
        Logger.error(`${logPrefix} - Failed to delete message ${message.id}: ${error}`);
    }

    // The DM has to go out before the ban: afterwards the bot and the user share no server anymore
    let dmSent = true;
    try {
        await member.send({ embeds: [dmEmbed(member, moderator, message.channel.name, honeypot, shouldBan)] });
    } catch (error) {
        dmSent = false;
        Logger.warn(`${logPrefix} - DM not sent: ${error}`);
    }

    const ban = shouldBan
        ? await banMember({
              member,
              moderator,
              reason: banReason,
              deleteMessageSeconds: honeypot.deleteWindowSeconds,
              notifyUser: false,
          })
        : undefined;
    const unban = ban?.success
        ? await unbanUser({ guild, userID: author.id, moderator, reason: unbanReason })
        : undefined;

    await sendModLog(guild, summaryEmbed(message, honeypot, { timeout, messageDeleted, dmSent, ban, unban }));

    const status = (result?: ModerationActionResult) => (result ? (result.success ? 'ok' : 'failed') : 'skipped');
    Logger.info(
        `${logPrefix} - Finished (timeout: ${status(timeout)}, ban: ${status(ban)}, unban: ${status(unban)}, message deleted: ${messageDeleted}, DM sent: ${dmSent})`,
    );
}

/**
 * Called by messageCreateHandler for every message posted in the honeypot channel.
 */
export async function handleHoneypot(client: Client, message: Message) {
    const { honeypot } = constantsConfig;
    if (!honeypot || !message.inGuild()) {
        return;
    }

    const { author, guild } = message;
    const logPrefix = `Honeypot - Message ${message.id} from user ${author.id}`;
    try {
        const member = message.member ?? (await guild.members.fetch(author.id).catch(() => null));
        if (!member) {
            Logger.info(`${logPrefix} - Ignoring, the member could not be resolved (already removed?)`);
            return;
        }
        if (member.roles.cache.hasAny(...constantsConfig.roleGroups.STAFF)) {
            Logger.info(`${logPrefix} - Ignoring, the member is part of the staff`);
            return;
        }
        if (inFlight.has(author.id)) {
            Logger.info(`${logPrefix} - Ignoring, honeypot actions are already in progress for this user`);
            return;
        }
        const moderator = client.user;
        if (!moderator) {
            Logger.error(`${logPrefix} - The client user is not available, cannot act`);
            return;
        }
        // Support members are only timed out, everyone else is banned to purge their messages and unbanned again
        const shouldBan = !member.roles.cache.hasAny(...constantsConfig.roleGroups.SUPPORT);

        inFlight.add(author.id);
        try {
            await applyActions(message, member, moderator, honeypot, shouldBan);
        } finally {
            inFlight.delete(author.id);
        }
    } catch (error) {
        Logger.error(`${logPrefix} - Unexpected error: ${error}`);
    }
}
