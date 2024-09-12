import { ChannelType, ChatInputCommandInteraction, Colors, EmbedBuilder, EmbedField, TextChannel } from 'discord.js';
import { Logger } from '../../../../lib';
import { SlowmodeChannel } from '../slowmode';
import { Agenda } from '@hokify/agenda';

export async function handleDisableSlowmode(
  interaction: ChatInputCommandInteraction<'cached'>,
  slowmodeChannel: SlowmodeChannel,
  modLogsChannel: TextChannel,
  scheduler: Agenda | null,
  failedEmbed: (action: string, channel: string) => EmbedBuilder,
  noChannelEmbed: (action: string, channel: string) => EmbedBuilder,
  successEmbed: (action: string, channel: string) => EmbedBuilder,
  modLogEmbed: (action: string, fields: EmbedField[], color: number) => EmbedBuilder,
  slowModeEmbedField: (moderator: string, channel: string, duration: number, autoDisable: string) => EmbedField[],
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
          slowModeEmbedField(interaction.user.toString(), slowmodeChannel.id, 0, '0'),
          Colors.Green,
        ),
      ],
    });
  } catch {
    await interaction.reply({ embeds: [noChannelEmbed('Disable', 'Mod Log')] });
  }

  await interaction.reply({ embeds: [successEmbed('Disable', slowmodeChannel.id)], ephemeral: true });
}
