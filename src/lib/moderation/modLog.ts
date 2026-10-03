import { EmbedBuilder, Guild } from 'discord.js';
import moment from 'moment';
import { constantsConfig } from '../config';
import { Logger } from '../logger';

// The date format used by every mod log and DM embed.
export const formatModLogDate = (date: Date): string => moment(date).utcOffset(0).format();

/**
 * Posts an embed to the mod logs channel. Never throws; returns whether the message was sent.
 */
export async function sendModLog(guild: Guild, embed: EmbedBuilder, content?: string): Promise<boolean> {
    const channelId = constantsConfig.channels.MOD_LOGS;
    const channel = guild.channels.resolve(channelId);
    if (!channel || !channel.isSendable()) {
        Logger.warn(`Mod Log - Channel ${channelId} not found or not sendable in guild ${guild.id}`);
        return false;
    }

    try {
        await channel.send({ ...(content && { content }), embeds: [embed] });
        return true;
    } catch (error) {
        Logger.warn(`Mod Log - Failed to send to channel ${channelId}: ${error}`);
        return false;
    }
}
