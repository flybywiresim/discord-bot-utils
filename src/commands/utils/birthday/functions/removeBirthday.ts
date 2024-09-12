import { ChatInputCommandInteraction, Colors, User } from 'discord.js';
import { Birthday, makeEmbed } from '../../../../lib';

const noBirthdayEmbed = (discordUser: User) =>
  makeEmbed({
    title: 'Birthday remove failed',
    description: `${discordUser.toString()} doesn't have a birthday set`,
    color: Colors.Red,
  });

const birthdayRemovedEmbed = (discordUser: User) =>
  makeEmbed({
    title: 'Birthday removed',
    description: `${discordUser.toString()}'s birthday has been removed`,
  });

export async function handleRemoveBirthday(interaction: ChatInputCommandInteraction<'cached'>) {
  const userID = interaction.user.id;
  const discordUser = interaction.user;

  const birthday = await Birthday.findOne({ userID });

  if (!birthday) {
    await interaction.reply({ embeds: [noBirthdayEmbed(discordUser)] });
  } else {
    await Birthday.deleteOne({ userID });
    await interaction.reply({ embeds: [birthdayRemovedEmbed(discordUser)] });
  }
}
