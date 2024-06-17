import moment from 'moment/moment';
import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import mongoose from 'mongoose';
import { constantsConfig, getConn, Infraction, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
  title: 'Note - No Connection',
  description: 'Could not connect to the database',
  color: Colors.Red,
});

const noteFailed = makeEmbed({
  title: 'Note - Failed',
  description: 'Failed to add user note, doc not saved to mongoDB',
  color: Colors.Red,
});

const modLogEmbed = (formattedDate: any, moderator: User, discordUser: User, note: string) =>
  makeEmbed({
    author: {
      name: `[NOTE]  ${discordUser.tag}`,
      iconURL: discordUser.displayAvatarURL(),
    },
    fields: [
      {
        inline: false,
        name: 'User',
        value: discordUser.toString(),
      },
      {
        inline: false,
        name: 'Moderator',
        value: moderator.toString(),
      },
      {
        inline: false,
        name: 'Note',
        value: note,
      },
      {
        inline: false,
        name: 'Date',
        value: formattedDate,
      },
    ],
    footer: { text: `User ID: ${discordUser.id}` },
    color: Colors.Red,
  });

const noteEmbed = (user: User) =>
  makeEmbed({
    title: `Note for ${user.tag} has been added successfully`,
    color: Colors.Green,
  });

const noModLogs = makeEmbed({
  title: 'Note - No Mod Log',
  description: 'The user note was added, but no mod log was sent. Please check the channel still exists',
  color: Colors.Red,
});

export async function handleUserNoteInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
  const conn = getConn();

  if (!conn) {
    await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
    return;
  }

  const userID = interaction.options.getUser('tag_or_id')?.id;

  if (!userID) {
    await interaction.reply({ content: 'Please provide a user tag or ID.', ephemeral: true });
    return;
  }

  const note = interaction.options.getString('note');

  if (!note) {
    await interaction.reply({ content: 'Please provide a note.', ephemeral: true });
    return;
  }

  const discordUser = await interaction.client.users.fetch(userID);

  const moderator = interaction.user;

  const currentDate = new Date();

  const formattedDate: string = moment(currentDate).utcOffset(0).format();

  const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

  //Try to save to the database

  Logger.info('Starting Infraction process');

  const newInfraction = {
    infractionType: 'Note',
    moderatorID: moderator.id,
    reason: note,
    date: currentDate,
    infractionID: new mongoose.Types.ObjectId(),
  };

  let userData = await Infraction.findOne({ userID });

  Logger.info(userData);

  if (!userData) {
    userData = new Infraction({
      userID,
      infractions: [newInfraction],
    });
    Logger.info(userData);
    Logger.info('New user data created');
  } else {
    userData.infractions.push(newInfraction);
    Logger.info('User data updated');
  }

  try {
    await userData.save();
    Logger.info('Infraction process complete');
  } catch (error) {
    await interaction.reply({ embeds: [noteFailed], ephemeral: true });
    Logger.error(error);
  }

  //Send embed to mod-logs channel

  try {
    await modLogsChannel.send({ embeds: [modLogEmbed(formattedDate, moderator, discordUser, note)] });
  } catch {
    await interaction.reply({ embeds: [noModLogs], ephemeral: true });
    return;
  }
  await interaction.reply({ embeds: [noteEmbed(discordUser)], ephemeral: true });
}
