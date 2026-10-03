import { Client, codeBlock, Colors, Guild, Message, User } from 'discord.js';
import {
    banUser,
    constantsConfig,
    durationInEnglish,
    imageBaseUrl,
    Logger,
    makeEmbed,
    makeLines,
    ModerationActionResult,
    sendModLog,
    timeoutUser,
    unbanUser,
} from '../../lib';

type HoneypotConfig = NonNullable<typeof constantsConfig.honeypot>;

const MAX_MESSAGE_LENGTH = 1024 - 8;
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

const dmEmbed = (guild: Guild, channelName: string, honeypot: HoneypotConfig, banned: boolean) =>
    makeEmbed({
        title: banned ? `You have been removed from ${guild.name}` : `You have been timed out in ${guild.name}`,
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
            'If you believe this was a mistake, please contact the moderation team.',
        ]),
        footer: {
            text: `Your timeout will be lifted on ${new Date(Date.now() + honeypot.timeoutDurationSeconds * 1000).toUTCString()}`,
        },
    });

const describeError = (error: unknown) => `${error}`.slice(0, MAX_ERROR_LENGTH);

const actionLine = (name: string, result: ModerationActionResult, applied: string) =>
    `${name}: ${result.success ? applied : `failed - ${describeError(result.error)}`}`;

const summaryEmbed = (message: Message<true>, honeypot: HoneypotConfig, outcome: HoneypotOutcome) => {
    const { author } = message;
    const { timeout, messageDeleted, dmSent, ban, unban } = outcome;

    let messageContent = message.content;
    let messageContentFieldTitle = 'Message Content';
    if (messageContent.length > MAX_MESSAGE_LENGTH) {
        messageContent = `${message.content.slice(0, MAX_MESSAGE_LENGTH - 3)}...`;
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
                  `applied, messages of the last ${durationInEnglish(honeypot.deleteWindowSeconds * 1000)} deleted`,
              ),
              unban
                  ? actionLine('Unban', unban, 'applied') + (unban.success ? '' : ', the user is still banned')
                  : 'Unban: skipped, the ban failed',
          ]
        : ['Ban and unban: skipped, the user is part of the team'];

    const actions = [
        actionLine('Timeout', timeout, `applied for ${durationInEnglish(honeypot.timeoutDurationSeconds * 1000)}`),
        messageDeleted ? 'Message: deleted' : 'Message: not deleted',
        dmSent ? 'DM: sent' : 'DM: not sent, they have DMs closed or blocked the bot',
        ...banLines,
        unsavedInfraction && !unsavedInfraction.saved
            ? `Infractions: not logged (${unsavedInfraction.reason})`
            : 'Infractions: logged',
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

async function applyActions(
    message: Message<true>,
    moderator: User,
    honeypot: HoneypotConfig,
    shouldBan: boolean,
    messageDeleted: boolean,
) {
    const { author, guild } = message;
    const logPrefix = `Honeypot - User ${author.id}`;
    Logger.info(
        `Honeypot - ${author.tag} (${author.id}) posted message ${message.id}, ${shouldBan ? 'starting softban' : 'timing out support member'}`,
    );

    // The actions post no mod logs of their own, the summary below reports everything at once
    const timeout = await timeoutUser({
        guild,
        user: author,
        moderator,
        reason: timeoutReason,
        durationSeconds: honeypot.timeoutDurationSeconds,
        notifyUser: false,
        notifyModerators: false,
    });

    // The DM has to go out before the ban: afterwards the bot and the user share no server anymore
    let dmSent = true;
    try {
        await author.send({ embeds: [dmEmbed(guild, message.channel.name, honeypot, shouldBan)] });
    } catch (error) {
        dmSent = false;
        Logger.warn(`${logPrefix} - DM not sent: ${error}`);
    }

    const ban = shouldBan
        ? await banUser({
              guild,
              user: author,
              moderator,
              reason: banReason,
              deleteMessageSeconds: honeypot.deleteWindowSeconds,
              notifyUser: false,
              notifyModerators: false,
          })
        : undefined;
    const unban = ban?.success
        ? await unbanUser({ guild, user: author, moderator, reason: unbanReason, notifyModerators: false })
        : undefined;

    await sendModLog(guild, summaryEmbed(message, honeypot, { timeout, messageDeleted, dmSent, ban, unban }));

    const status = (result?: ModerationActionResult) => (result ? (result.success ? 'ok' : 'failed') : 'skipped');
    Logger.info(
        `${logPrefix} - Finished (timeout: ${status(timeout)}, ban: ${status(ban)}, unban: ${status(unban)}, message deleted: ${messageDeleted}, DM sent: ${dmSent})`,
    );
}

export async function handleHoneypot(client: Client, message: Message) {
    const { honeypot } = constantsConfig;
    if (!honeypot || !message.inGuild() || message.system) {
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

        let messageDeleted = true;
        try {
            await message.delete();
        } catch (error) {
            messageDeleted = false;
            Logger.error(`${logPrefix} - Failed to delete the message: ${error}`);
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
            await applyActions(message, moderator, honeypot, shouldBan, messageDeleted);
        } finally {
            inFlight.delete(author.id);
        }
    } catch (error) {
        Logger.error(`${logPrefix} - Unexpected error: ${error}`);
    }
}
