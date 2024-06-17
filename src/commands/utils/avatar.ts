import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
  name: 'avatar',
  description: "Shows the selected user's avatar",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'tag_or_id',
      description: 'Please provide a user tag or ID.',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
});

export default slashCommand(data, async ({ interaction }) => {
  const user = interaction.options.getUser('tag_or_id') || interaction.user;

  const avatarEmbed = makeEmbed({
    title: `${user.tag}'s avatar`,
    image: { url: user.displayAvatarURL({ size: 4096 }) },
  });

  return interaction.reply({ embeds: [avatarEmbed] });
});
