import { Colors, EmbedBuilder, Guild, GuildMember, User } from 'discord.js';
import { constantsConfig } from '../config';
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
          // null when no mod log was attempted (notifyModerators false).
          modLogSent: boolean | null;
          // null when the action records nothing (remove timeout).
          infraction: AddInfractionResult | null;
      }
    | {
          success: false;
          error: unknown;
          // DM can be sent before the infraction
          dmSent?: boolean;
      };

// Every action targets a user of a guild and is performed by a moderator (the bot user for automated actions).
interface ModerationActionOptions {
    guild: Guild;
    user: User;
    moderator: User;
    // Defaults to true. Automated actions that post their own summary set this to false.
    notifyModerators?: boolean;
}

export interface TimeoutUserOptions extends ModerationActionOptions {
    reason: string;
    durationSeconds: number;
    // Defaults to true. Automated actions that send their own DM set this to false.
    notifyUser?: boolean;
}

export type RemoveTimeoutOptions = ModerationActionOptions;

export interface BanUserOptions extends ModerationActionOptions {
    reason: string;
    deleteMessageSeconds?: number;
    notifyUser?: boolean;
}

export interface UnbanUserOptions extends ModerationActionOptions {
    reason: string;
}

export interface WarnUserOptions extends ModerationActionOptions {
    reason: string;
}

export interface AddUserNoteOptions extends ModerationActionOptions {
    note: string;
}

const userIdFooter = (user: User) => ({ text: `User ID: ${user.id}` });

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

const unbanModLogEmbed = (moderator: User, user: User, reason: string, formattedDate: string) =>
    makeEmbed({
        author: { name: `[UNBANNED] ${user.id}` },
        fields: [
            { name: 'User', value: user.id },
            { name: 'Moderator', value: moderator.toString() },
            { name: 'Reason', value: reason },
            { name: 'Date', value: formattedDate },
        ],
        footer: userIdFooter(user),
        color: Colors.Red,
    });

const warnDmEmbed = (guild: Guild, formattedDate: string, moderator: User, reason: string) =>
    makeEmbed({
        title: `You have been warned in ${guild.name}`,
        fields: [
            { inline: false, name: 'Moderator', value: moderator.toString() },
            { inline: false, name: 'Reason', value: reason },
            { inline: false, name: 'Date', value: formattedDate },
        ],
    });

const warnModLogEmbed = (formattedDate: string, moderator: User, user: User, reason: string) =>
    makeEmbed({
        author: { name: `[WARNED]  ${user.tag}`, iconURL: user.displayAvatarURL() },
        fields: [
            { inline: false, name: 'User', value: user.toString() },
            { inline: false, name: 'Moderator', value: moderator.toString() },
            { inline: false, name: 'Reason', value: reason },
            { inline: false, name: 'Date', value: formattedDate },
        ],
        footer: userIdFooter(user),
        color: Colors.Red,
    });

const noteModLogEmbed = (formattedDate: string, moderator: User, user: User, note: string) =>
    makeEmbed({
        author: { name: `[NOTE]  ${user.tag}`, iconURL: user.displayAvatarURL() },
        fields: [
            { inline: false, name: 'User', value: user.toString() },
            { inline: false, name: 'Moderator', value: moderator.toString() },
            { inline: false, name: 'Note', value: note },
            { inline: false, name: 'Date', value: formattedDate },
        ],
        footer: userIdFooter(user),
        color: Colors.Red,
    });

async function sendDm(user: User, embed: EmbedBuilder): Promise<boolean> {
    try {
        await user.send({ embeds: [embed] });
        return true;
    } catch (error) {
        Logger.debug(`DM not sent to ${user.tag} (${user.id}): ${error}`);
        return false;
    }
}

const describeActor = (user: User) => `${user.tag} (${user.id})`;

/**
 * Times out a user, DMs them (unless notifyUser is false), posts the mod log and records the infraction.
 */
export async function timeoutUser(options: TimeoutUserOptions): Promise<ModerationActionResult> {
    const { guild, user, moderator, reason, durationSeconds, notifyUser = true, notifyModerators = true } = options;
    const durationMs = durationSeconds * 1000;
    const date = new Date();

    let updatedMember: GuildMember;
    try {
        const member = await guild.members.fetch(user);
        updatedMember = await member.timeout(durationMs, reason);
    } catch (error) {
        Logger.error(`Timeout - Failed to time out ${describeActor(user)}: ${error}`);
        return { success: false, error };
    }
    // timeout() returns a patched copy; the cached member is only updated once the gateway event arrives.
    if (!updatedMember.isCommunicationDisabled()) {
        const error = new Error('Discord did not report the member as timed out.');
        Logger.error(`Timeout - Failed to time out ${describeActor(user)}: ${error.message}`);
        return { success: false, error };
    }
    Logger.info(
        `Timeout - ${describeActor(user)} timed out for ${durationInEnglish(durationMs)} by ${describeActor(moderator)}: ${reason}`,
    );

    const dmSent = notifyUser
        ? await sendDm(
              user,
              timeoutDmEmbed(guild, moderator, durationMs, reason, updatedMember.communicationDisabledUntil),
          )
        : null;
    const modLogSent = notifyModerators
        ? await sendModLog(guild, timeoutModLogEmbed(moderator, user, reason, durationMs, formatModLogDate(date)))
        : null;
    const infraction = await addInfraction({
        userID: user.id,
        infractionType: 'Timeout',
        moderatorID: moderator.id,
        reason,
        duration: durationInEnglish(durationMs),
        date,
    });

    return { success: true, dmSent, modLogSent, infraction };
}

/**
 * Removes a user's timeout and posts the mod log. Nothing is recorded in the database.
 */
export async function removeTimeout(options: RemoveTimeoutOptions): Promise<ModerationActionResult> {
    const { guild, user, moderator, notifyModerators = true } = options;
    const date = new Date();

    try {
        const member = await guild.members.fetch(user);
        await member.timeout(null);
    } catch (error) {
        Logger.error(`Remove Timeout - Failed to remove the timeout of ${describeActor(user)}: ${error}`);
        return { success: false, error };
    }
    Logger.info(`Remove Timeout - Timeout of ${describeActor(user)} removed by ${describeActor(moderator)}`);

    const modLogSent = notifyModerators
        ? await sendModLog(guild, timeoutRemovedModLogEmbed(moderator, user, formatModLogDate(date)))
        : null;

    return { success: true, dmSent: null, modLogSent, infraction: null };
}

/**
 * Bans a user, DMs them beforehand (unless notifyUser is false), posts the mod log and records the infraction.
 */
export async function banUser(options: BanUserOptions): Promise<ModerationActionResult> {
    const { guild, user, moderator, reason, notifyUser = true, notifyModerators = true } = options;
    const deleteMessageSeconds = Math.min(
        Math.max(Math.floor(options.deleteMessageSeconds ?? 0), 0),
        MAX_DELETE_MESSAGE_SECONDS,
    );
    const date = new Date();

    // Staff can never be banned, whoever asks
    const member = await guild.members.fetch(user).catch(() => null);
    if (member?.roles.cache.hasAny(...constantsConfig.roleGroups.STAFF)) {
        const error = new Error('Staff members cannot be banned.');
        Logger.error(`Ban - Refused to ban ${describeActor(user)}: ${error.message}`);
        return { success: false, error };
    }

    // The DM has to go out before the ban: afterwards the bot and the user share no server anymore.
    const dmSent = notifyUser ? await sendDm(user, banDmEmbed(guild, moderator, reason)) : null;

    try {
        await guild.members.ban(user, { deleteMessageSeconds, reason });
    } catch (error) {
        Logger.error(`Ban - Failed to ban ${describeActor(user)}: ${error}`);
        return { success: false, error, dmSent: dmSent ?? undefined };
    }
    Logger.info(
        `Ban - ${describeActor(user)} banned by ${describeActor(moderator)} (${deleteMessageSeconds} seconds of messages deleted): ${reason}`,
    );

    const modLogSent = notifyModerators
        ? await sendModLog(guild, banModLogEmbed(moderator, user, reason, deleteMessageSeconds, formatModLogDate(date)))
        : null;
    const infraction = await addInfraction({
        userID: user.id,
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
    const { guild, user, moderator, reason, notifyModerators = true } = options;
    const date = new Date();

    try {
        await guild.members.unban(user, reason);
    } catch (error) {
        Logger.error(`Unban - Failed to unban ${describeActor(user)}: ${error}`);
        return { success: false, error };
    }
    Logger.info(`Unban - ${describeActor(user)} unbanned by ${describeActor(moderator)}: ${reason}`);

    const modLogSent = notifyModerators
        ? await sendModLog(guild, unbanModLogEmbed(moderator, user, reason, formatModLogDate(date)))
        : null;
    const infraction = await addInfraction({
        userID: user.id,
        infractionType: 'Unban',
        moderatorID: moderator.id,
        reason,
        date,
    });

    return { success: true, dmSent: null, modLogSent, infraction };
}

/**
 * Records a warning, DMs the user and posts the mod log. The record is the action: when it cannot be saved
 * nothing else happens.
 */
export async function warnUser(options: WarnUserOptions): Promise<ModerationActionResult> {
    const { guild, user, moderator, reason, notifyModerators = true } = options;
    const date = new Date();
    const formattedDate = formatModLogDate(date);

    const infraction = await addInfraction({
        userID: user.id,
        infractionType: 'Warn',
        moderatorID: moderator.id,
        reason,
        date,
    });
    if (!infraction.saved) {
        return { success: false, error: infraction.error ?? new Error(infraction.reason) };
    }
    Logger.info(`Warn - ${describeActor(user)} warned by ${describeActor(moderator)}: ${reason}`);

    const dmSent = await sendDm(user, warnDmEmbed(guild, formattedDate, moderator, reason));
    const modLogSent = notifyModerators
        ? await sendModLog(guild, warnModLogEmbed(formattedDate, moderator, user, reason))
        : null;

    return { success: true, dmSent, modLogSent, infraction };
}

/**
 * Records a note about a user and posts the mod log. The record is the action: when it cannot be saved nothing
 * else happens.
 */
export async function addUserNote(options: AddUserNoteOptions): Promise<ModerationActionResult> {
    const { guild, user, moderator, note, notifyModerators = true } = options;
    const date = new Date();

    const infraction = await addInfraction({
        userID: user.id,
        infractionType: 'Note',
        moderatorID: moderator.id,
        reason: note,
        date,
    });
    if (!infraction.saved) {
        return { success: false, error: infraction.error ?? new Error(infraction.reason) };
    }
    Logger.info(`Note - Note added for ${describeActor(user)} by ${describeActor(moderator)}`);

    const modLogSent = notifyModerators
        ? await sendModLog(guild, noteModLogEmbed(formatModLogDate(date), moderator, user, note))
        : null;

    return { success: true, dmSent: null, modLogSent, infraction };
}
