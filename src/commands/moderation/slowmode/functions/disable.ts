import { ChannelType, ChatInputCommandInteraction, Colors } from 'discord.js';
import { Logger } from '../../../../lib';

export async function handleDisableSlowmode(
  interaction: ChatInputCommandInteraction<'cached'>,
  slowmodeChannel: any,
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
      await slowmodeChannel.setRateLimitPerUser(0, 'Slow mode disabled through bot');
      if (scheduler) {
        await scheduler.cancel({ name: 'autoDisableSlowMode', data: { channelId: slowmodeChannel.id } });
      }
    }
  } catch (error) {
    Logger.error(error);
    await interaction.reply({ embeds: [failedEmbed('Disable', slowmodeChannel.id)] });
    return;
  }

  try {
    await modLogsChannel.send({
      embeds: [
        modLogEmbed(
          'disabled',
          slowModeEmbedField(interaction.user.toString(), slowmodeChannel.id, 0, 0),
          Colors.Green,
        ),
      ],
    });
  } catch {
    await interaction.reply({ embeds: [noChannelEmbed('Disable', 'Mod Log')] });
  }

  await interaction.reply({ embeds: [successEmbed('Disable', slowmodeChannel.id)], ephemeral: true });
}
