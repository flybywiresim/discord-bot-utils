import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { Logger, makeEmbed, FAQ } from '../../../../lib';

const faqRemovedEmbed = (discordUser: User, faqQuestion: string, faqAnswer: string) =>
  makeEmbed({
    author: {
      name: `[FAQ Removed]  ${discordUser.tag}`,
      iconURL: discordUser.displayAvatarURL(),
    },
    fields: [
      {
        inline: false,
        name: 'Question',
        value: faqQuestion,
      },
      {
        inline: false,
        name: 'Answer',
        value: faqAnswer,
      },
    ],
    color: Colors.Red,
  });

export async function handleRemoveFaq(
  interaction: ChatInputCommandInteraction<'cached'>,
  faqID: string,
  modLogsChannel: TextChannel,
) {
  const discordUser = interaction.user;

  const faqEntry = await FAQ.findOne({ _id: faqID });

  if (!faqEntry) {
    await interaction.reply({ content: 'FAQ with this ID does not exist.', ephemeral: true });
    return;
  }

  const faqTitle = faqEntry.faqTitle || 'Unknown';
  const faqAnswer = faqEntry.faqAnswer || 'Unknown';

  try {
    await faqEntry.deleteOne();
  } catch (error) {
    Logger.error(error);
    await interaction.reply({
      content: 'Could not remove FAQ, error has been logged, please notify the bot team.',
      ephemeral: true,
    });
    return;
  }

  try {
    await modLogsChannel.send({ embeds: [faqRemovedEmbed(discordUser, faqTitle, faqAnswer)] });
  } catch (error) {
    Logger.error(error);
    await interaction.reply({
      content:
        'FAQ removed successfully, but could not send mod log, error has been logged, please notify the bot team.',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({ content: 'FAQ removed successfully.', ephemeral: true });
}
