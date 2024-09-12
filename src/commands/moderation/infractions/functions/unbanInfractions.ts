import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import moment from 'moment';
import mongoose from 'mongoose';
import { constantsConfig, getConn, Infraction, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
  title: 'Unban - No Connection',
  description: 'Could not connect to the database. I will still try to unban the user',
  color: Colors.Red,
});

const failedUnbanEmbed = (userID: string) =>
  makeEmbed({
    title: 'Unban - Failed',
    description: `Failed to Unban ${userID}, this user may not be banned.`,
    color: Colors.Red,
  });

const unbanEmbed = (userID: string) =>
  makeEmbed({
    title: `${userID} was unbanned successfully`,
    color: Colors.Green,
  });

const modLogEmbed = (moderator: User, userID: string, banReason: string, formattedDate: string) =>
  makeEmbed({
    author: { name: `[UNBANNED] ${userID}` },
    fields: [
      {
        name: 'User',
        value: userID,
      },
      {
        name: 'Moderator',
        value: `${moderator}`,
      },
      {
        name: 'Reason',
        value: `\u200B${banReason}`,
      },
      {
        name: 'Date',
        value: formattedDate,
      },
    ],
    footer: { text: `User ID: ${userID}` },
    color: Colors.Red,
  });

const noModLogs = makeEmbed({
  title: 'Unban - No Mod Log',
  description:
    "I can't find the mod logs channel. I will still try to unban the user. Please check the channel still exists.",
  color: Colors.Red,
});

const logFailed = makeEmbed({
  title: 'Unban - Failed to log',
  description: 'Failed to log the unban to the database.',
  color: Colors.Red,
});

export async function handleUnbanInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
  await interaction.deferReply({ ephemeral: true });

  const conn = getConn();

  if (!conn) {
    await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
    return;
  }

  const userID = interaction.options.getUser('id')!.id;

  const unbanReason = interaction.options.getString('reason')!;

  const moderator = interaction.user;
  const currentDate = new Date();
  const formattedDate: string = moment(currentDate).utcOffset(0).format();
  const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

  //Check if the mod logs channel exists

  if (!modLogsChannel) {
    await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
  }

  try {
    await interaction.guild.members.unban(userID, unbanReason);
    if (modLogsChannel) {
      await modLogsChannel.send({ embeds: [modLogEmbed(moderator, userID, unbanReason, formattedDate)] });
    }
    await interaction.followUp({ embeds: [unbanEmbed(userID)], ephemeral: true });
  } catch (error) {
    Logger.error(error);
    await interaction.followUp({ embeds: [failedUnbanEmbed(userID)], ephemeral: true });
    return;
  }

  //Log to the DB
  Logger.info('Starting Infraction process');

  const newInfraction = {
    infractionType: 'Unban',
    moderatorID: moderator.id,
    reason: unbanReason,
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
    await interaction.followUp({ embeds: [logFailed], ephemeral: true });
    Logger.error(error);
  }
}
