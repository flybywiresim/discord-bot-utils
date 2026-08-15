import { ChannelType, ChatInputCommandInteraction, Colors } from 'discord.js';

export async function handleSetSlowmode(
    interaction: ChatInputCommandInteraction<'cached'>,
    duration: number,
    slowmodeChannel: any,
    autoDisable: any,
    modLogsChannel: any,
    scheduler: any,
    failedEmbed: any,
    noChannelEmbed: any,
    successEmbed: any,
    modLogEmbed: any,
    slowModeEmbedField: any,
) {
    try {
        if (
            slowmodeChannel.type === ChannelType.GuildForum ||
            slowmodeChannel.type === ChannelType.GuildText ||
            slowmodeChannel.type === ChannelType.PrivateThread ||
            slowmodeChannel.type === ChannelType.PublicThread
        ) {
            await slowmodeChannel.setRateLimitPerUser(duration / 1000, 'Slow mode enabled through bot');
            if (scheduler) {
                await scheduler.cancel({ name: 'autoDisableSlowMode', data: { channelId: slowmodeChannel.id } });
                if (autoDisable) {
                    const executionDate: Date = new Date(Date.now() + autoDisable);
                    await scheduler.schedule(executionDate, 'autoDisableSlowMode', { channelId: slowmodeChannel.id });
                }
            }
        }
    } catch {
        await interaction.reply({ embeds: [failedEmbed('set', slowmodeChannel.id)], ephemeral: true });
        return;
    }

    try {
        await modLogsChannel.send({
            embeds: [
                modLogEmbed(
                    'Set',
                    slowModeEmbedField(
                        interaction.user.toString(),
                        slowmodeChannel.id,
                        duration,
                        autoDisable && scheduler ? autoDisable.toString() : 0,
                    ),
                    Colors.Green,
                ),
            ],
        });
    } catch {
        await interaction.reply({ embeds: [noChannelEmbed('set', 'mod logs')], ephemeral: true });
        return;
    }

    await interaction.reply({ embeds: [successEmbed('set', slowmodeChannel.id)], ephemeral: true });
}
