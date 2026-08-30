import { Colors, EmbedBuilder, Guild, GuildMember, User } from 'discord.js';
import { durationInEnglish } from '../durationInEnglish';
import { makeEmbed } from '../embed';
import { Logger } from '../logger';
import { addInfraction, AddInfractionResult } from './addInfraction';
import { formatModLogDate, sendModLog } from './modLog';

// Discord's limit for deleting a banned user's messages.
export const MAX_DELETE_MESSAGE_SECONDS = 7 * 24 * 60 * 60;

export type ModerationActionResult =
    | {
          success: true;
          // null when no DM was attempted (notifyUser false, or the action has no DM).
          dmSent: boolean | null;
          modLogSent: boolean;
          // null when the action records nothing (remove timeout).
          infraction: AddInfractionResult | null;
      }
    | {
          success: false;
          error: unknown;
          // DM can be sent before the infraction
          dmSent?: boolean;
      };

export interface TimeoutMemberOptions {
    member: GuildMember;
    moderator: User;
    reason: string;
    durationSeconds: number;
    // Defaults to true. Automated actions that send their own DM set this to false.
    notifyUser?: boolean;
}

export interface RemoveTimeoutOptions {
    member: GuildMember;
    moderator: User;
}

export interface BanMemberOptions {
    member: GuildMember;
    moderator: User;
    reason: string;
    deleteMessageSeconds?: number;
    notifyUser?: boolean;
}

export interface UnbanUserOptions {
    guild: Guild;
    userID: string;
    moderator: User;
    reason: string;
}

const userIdFooter = (user: User | string) => ({ text: `User ID: ${typeof user === 'string' ? user : user.id}` });

const timeoutDmEmbed = (guild: Guild, moderator: User, durationMs: number, reason: string, timedOutUntil: Date) =>
    makeEmbed({
        title: `You have been timed out in ${guild.name}`,
        description: 'This timeout is also logged against your record.',
        fields: [
            { inline: true, name: 'Duration', value: durationInEnglish(durationMs) },
            { inline: true, name: 'Moderator', value: moderator.toString() },
            { inline: false, name: 'Reason', value: reason },
        ],
        footer: { text: `Your timeout will be lifted on ${timedOutUntil.toUTCString()}` },
    });

const timeoutModLogEmbed = (moderator: User, user: User, reason: string, durationMs: number, formattedDate: string) =>
    makeEmbed({
        author: { name: `[TIMED OUT] ${user.tag}`, iconURL: user.displayAvatarURL() },
        fields: [
            { name: 'User', value: user.toString() },
            { name: 'Moderator', value: moderator.toString() },
            { name: 'Reason', value: reason },
            { name: 'Duration', value: durationInEnglish(durationMs) },
            { name: 'Date', value: formattedDate },
        ],
        footer: userIdFooter(user),
        color: Colors.Red,
    });

const timeoutRemovedModLogEmbed = (moderator: User, user: User, formattedDate: string) =>
    makeEmbed({
        author: { name: `[TIMEOUT REMOVED] ${user.tag}`, iconURL: user.displayAvatarURL() },
        fields: [
            { inline: true, name: 'Moderator', value: moderator.toString() },
            { inline: true, name: 'User', value: user.toString() },
            { inline: false, name: 'Date', value: formattedDate },
        ],
        footer: userIdFooter(user),
        color: Colors.Green,
    });

const banDmEmbed = (guild: Guild, moderator: User, reason: string) =>
    makeEmbed({
        title: `You have been banned from ${guild.name}`,
        description: 'This ban is also logged against your record.',
        fields: [
            { inline: true, name: 'Moderator', value: moderator.toString() },
            { inline: false, name: 'Reason', value: reason },
            {
                inline: false,
                name: 'Appeal',
                value: `If you would like to appeal your ban, please fill out [this form.](${process.env.BAN_APPEAL_URL})`,
            },
        ],
    });

const banModLogEmbed = (
    moderator: User,
    user: User,
    reason: string,
    deleteMessageSeconds: number,
    formattedDate: string,
) =>
    makeEmbed({
        author: { name: `[BANNED] ${user.tag}`, iconURL: user.displayAvatarURL() },
        fields: [
            { name: 'User', value: user.toString() },
            { name: 'Moderator', value: moderator.toString() },
            { name: 'Reason', value: reason },
            {
                name: 'Messages deleted',
                value: deleteMessageSeconds > 0 ? `Last ${durationInEnglish(deleteMessageSeconds * 1000)}` : 'None',
            },
            { name: 'Date', value: formattedDate },
        ],
        footer: userIdFooter(user),
        color: Colors.Red,
    });

const unbanModLogEmbed = (moderator: User, userID: string, reason: string, formattedDate: string) =>
    makeEmbed({
        author: { name: `[UNBANNED] ${userID}` },
        fields: [
            { name: 'User', value: userID },
            { name: 'Moderator', value: moderator.toString() },
            { name: 'Reason', value: reason },
            { name: 'Date', value: formattedDate },
        ],
        footer: userIdFooter(userID),
        color: Colors.Red,
    });

async function sendDm(member: GuildMember, embed: EmbedBuilder): Promise<boolean> {
    try {
        await member.send({ embeds: [embed] });
        return true;
    } catch (error) {
        Logger.debug(`DM not sent to ${member.user.tag} (${member.id}): ${error}`);
        return false;
    }
}

const describeActor = (user: User) => `${user.tag} (${user.id})`;

/**
 * Times out a member, DMs them (unless notifyUser is false), posts the mod log and records the infraction.
 */
export async function timeoutMember(options: TimeoutMemberOptions): Promise<ModerationActionResult> {
    const { member, moderator, reason, durationSeconds, notifyUser = true } = options;
    const durationMs = durationSeconds * 1000;
    const date = new Date();

    let updatedMember: GuildMember;
    try {
        updatedMember = await member.timeout(durationMs, reason);
    } catch (error) {
        Logger.error(`Timeout - Failed to time out ${describeActor(member.user)}: ${error}`);
        return { success: false, error };
    }
    // timeout() returns a patched copy; the cached member is only updated once the gateway event arrives.
    if (!updatedMember.isCommunicationDisabled()) {
        const error = new Error('Discord did not report the member as timed out.');
        Logger.error(`Timeout - Failed to time out ${describeActor(member.user)}: ${error.message}`);
        return { success: false, error };
    }
    Logger.info(
        `Timeout - ${describeActor(member.user)} timed out for ${durationInEnglish(durationMs)} by ${describeActor(moderator)}: ${reason}`,
    );

    const dmSent = notifyUser
        ? await sendDm(
              member,
              timeoutDmEmbed(member.guild, moderator, durationMs, reason, updatedMember.communicationDisabledUntil),
          )
        : null;
    const modLogSent = await sendModLog(
        member.guild,
        timeoutModLogEmbed(moderator, member.user, reason, durationMs, formatModLogDate(date)),
    );
    const infraction = await addInfraction({
        userID: member.id,
        infractionType: 'Timeout',
        moderatorID: moderator.id,
        reason,
        duration: durationInEnglish(durationMs),
        date,
    });

    return { success: true, dmSent, modLogSent, infraction };
}

/**
 * Removes a member's timeout and posts the mod log. Nothing is recorded in the database.
 */
export async function removeTimeout(options: RemoveTimeoutOptions): Promise<ModerationActionResult> {
    const { member, moderator } = options;
    const date = new Date();

    try {
        await member.timeout(null);
    } catch (error) {
        Logger.error(`Remove Timeout - Failed to remove the timeout of ${describeActor(member.user)}: ${error}`);
        return { success: false, error };
    }
    Logger.info(`Remove Timeout - Timeout of ${describeActor(member.user)} removed by ${describeActor(moderator)}`);

    const modLogSent = await sendModLog(
        member.guild,
        timeoutRemovedModLogEmbed(moderator, member.user, formatModLogDate(date)),
    );

    return { success: true, dmSent: null, modLogSent, infraction: null };
}

/**
 * Bans a member, DMs them beforehand (unless notifyUser is false), posts the mod log and records the infraction.
 */
export async function banMember(options: BanMemberOptions): Promise<ModerationActionResult> {
    const { member, moderator, reason, notifyUser = true } = options;
    const deleteMessageSeconds = Math.min(
        Math.max(Math.floor(options.deleteMessageSeconds ?? 0), 0),
        MAX_DELETE_MESSAGE_SECONDS,
    );
    const date = new Date();

    // The DM has to go out before the ban: afterwards the bot and the user share no server anymore.
    const dmSent = notifyUser ? await sendDm(member, banDmEmbed(member.guild, moderator, reason)) : null;

    try {
        await member.ban({ deleteMessageSeconds, reason });
    } catch (error) {
        Logger.error(`Ban - Failed to ban ${describeActor(member.user)}: ${error}`);
        return { success: false, error, dmSent: dmSent ?? undefined };
    }
    Logger.info(
        `Ban - ${describeActor(member.user)} banned by ${describeActor(moderator)} (${deleteMessageSeconds} seconds of messages deleted): ${reason}`,
    );

    const modLogSent = await sendModLog(
        member.guild,
        banModLogEmbed(moderator, member.user, reason, deleteMessageSeconds, formatModLogDate(date)),
    );
    const infraction = await addInfraction({
        userID: member.id,
        infractionType: 'Ban',
        moderatorID: moderator.id,
        reason,
        date,
    });

    return { success: true, dmSent, modLogSent, infraction };
}

/**
 * Unbans a user, posts the mod log and records the infraction.
 */
export async function unbanUser(options: UnbanUserOptions): Promise<ModerationActionResult> {
    const { guild, userID, moderator, reason } = options;
    const date = new Date();

    try {
        await guild.members.unban(userID, reason);
    } catch (error) {
        Logger.error(`Unban - Failed to unban user ${userID}: ${error}`);
        return { success: false, error };
    }
    Logger.info(`Unban - User ${userID} unbanned by ${describeActor(moderator)}: ${reason}`);

    const modLogSent = await sendModLog(guild, unbanModLogEmbed(moderator, userID, reason, formatModLogDate(date)));
    const infraction = await addInfraction({
        userID,
        infractionType: 'Unban',
        moderatorID: moderator.id,
        reason,
        date,
    });

    return { success: true, dmSent: null, modLogSent, infraction };
}
