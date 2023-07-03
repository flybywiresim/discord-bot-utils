import { Job } from '@hokify/agenda';
import { ChannelType, TextChannel, Colors } from 'discord.js';
import { client } from '../../client';
import { constantsConfig, makeEmbed, Logger, getScheduler } from '../index';

const failedEmbed = (action: string, channel: string) => makeEmbed({
    title: `Slow Message - ${action} failed`,
    description: `Failed to ${action} the slow mode for channel <#${channel}>.`,
    color: Colors.Red,
});

const modLogEmbed = (action: string, fields: any, color: number) => makeEmbed({
    title: `Slow Mode - ${action}`,
    fields,
    color,
});

export async function autoDisableSlowMode(job: Job) {
    const scheduler = getScheduler();
    if (!scheduler) {
        Logger.error('Failed to get scheduler instance');
        return;
    }
    // Needed because of https://github.com/agenda/agenda/issues/401
    // eslint-disable-next-line no-underscore-dangle
    const matchingJobs = await scheduler.jobs({ _id: job.attrs._id });
    if (matchingJobs.length !== 1) {
        Logger.debug('Job has been deleted already, skipping execution.');
        return;
    }
    const { channelId } = job.attrs.data as { channelId: string };
    const modLogsChannel = client.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel | null;
    const slowmodeChannel = client.channels.resolve(channelId);
    if (!slowmodeChannel || [ChannelType.GuildText, ChannelType.GuildForum, ChannelType.PublicThread, ChannelType.PrivateThread].indexOf(slowmodeChannel.type) === -1) {
        Logger.error('Slow mode - Auto disable - Unable to disable for non-existing channel');
        if (modLogsChannel) {
            await modLogsChannel.send({ embeds: [failedEmbed('Auto disable', channelId)] });
        }
        return;
    }
    try {
        if (slowmodeChannel.type === ChannelType.GuildForum || slowmodeChannel.type === ChannelType.GuildText || slowmodeChannel.type === ChannelType.PrivateThread || slowmodeChannel.type === ChannelType.PublicThread) {
            await slowmodeChannel.setRateLimitPerUser(0, 'Slow mode disabled through bot');
        }
        await job.remove();
    } catch (err) {
        Logger.error(`Failed to auto disable slow mode for channel <#${channelId}>: ${err}`);
        return;
    }

    try {
        // @ts-ignore
        await modLogsChannel.send({
            embeds: [modLogEmbed('Auto Disable', [
                {
                    inline: true,
                    name: 'Channel',
                    value: `<#${channelId}>`,
                },
                {
                    inline: true,
                    name: 'Slow mode limit',
                    value: 'Disabled',
                },
                {
                    inline: true,
                    name: 'Auto disable timeout',
                    value: 'None',
                },
                {
                    inline: true,
                    name: 'Moderator',
                    value: 'FBW Bot',
                },
            ],
            Colors.Green)],
        });
    } catch (err) {
        Logger.warn(`Failed to send Mod Log for auto disable of slow mode for channel <#${channelId}>: ${err}`);
    }
}
