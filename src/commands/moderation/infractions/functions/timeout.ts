import { ChatInputCommandInteraction, Colors, Guild, TextChannel, User } from 'discord.js';
import moment from 'moment';
import mongoose from 'mongoose';
import { constantsConfig, durationInEnglish, getConn, Infraction, Logger, makeEmbed, makeLines } from '../../../../lib';

const noConnEmbed = makeEmbed({
  title: 'Timeout - No Connection',
  description: 'Could not connect to the database. I will still try to timeout the user',
  color: Colors.Red,
});

const failedTimeoutEmbed = (discordUser: User, error: any) =>
  makeEmbed({
    title: 'Timeout - Failed',
    description: makeLines([`Failed to timeout ${discordUser.toString()}`, '', error]),
    color: Colors.Red,
  });

const DMEmbed = (moderator: User, timeoutDuration: string, reason: string, guild: Guild, timedOutUntil: Date) =>
  makeEmbed({
    title: `You have been timed out in ${guild.name}`,
    description: 'This timeout is also logged against your record.',
    fields: [
      {
        inline: true,
        name: 'Duration',
        value: durationInEnglish(Number.parseInt(timeoutDuration)),
      },
      {
        inline: true,
        name: 'Moderator',
        value: moderator.toString(),
      },
      {
        inline: false,
        name: 'Reason',
        value: reason,
      },
    ],
    footer: { text: `Your timeout will be lifted on ${timedOutUntil.toUTCString()}` },
  });

const timeoutEmbed = (discordUser: User) =>
  makeEmbed({
    title: `${discordUser.tag} was timed out successfully`,
    color: Colors.Green,
  });

const DMFailed = (discordUser: User) =>
  makeEmbed({
    title: 'Timeout - DM not sent',
    description: `DM was not sent to ${discordUser.toString()}, they either have DMs closed or share no mutual servers with the bot.`,
    color: Colors.Red,
  });

const modLogEmbed = (
  moderator: User,
  discordUser: User,
  timeoutReason: string,
  timeoutDuration: string,
  formattedDate: string,
) =>
  makeEmbed({
    author: {
      name: `[TIMED OUT] ${discordUser.tag}`,
      iconURL: discordUser.displayAvatarURL(),
    },
    fields: [
      {
        name: 'User',
        value: discordUser.toString(),
      },
      {
        name: 'Moderator',
        value: `${moderator}`,
      },
      {
        name: 'Reason',
        value: `\u200B${timeoutReason}`,
      },
      {
        name: 'Duration',
        value: durationInEnglish(Number.parseInt(timeoutDuration)),
      },
      {
        name: 'Date',
        value: formattedDate,
      },
    ],
    footer: { text: `User ID: ${discordUser.id}` },
    color: Colors.Red,
  });

const noModLogs = makeEmbed({
  title: 'Timeout - No Mod Log',
  description: 'The user was timed out, but no mod log was sent. Please check the channel still exists',
  color: Colors.Red,
});

const logFailed = makeEmbed({
  title: 'Timeot - Failed to log',
  description: 'Failed to log the timeout to the database.',
  color: Colors.Red,
});

const communicationNotDisabledEmbed = (discordUser: User) =>
  makeEmbed({
    title: 'Timeout - Communication not disabled',
    description: `Bot has not detected that ${discordUser.toString()} was successfully timed out. Timeout may have failed.`,
    color: Colors.Red,
  });

export async function handleTimeoutInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
  await interaction.deferReply({ ephemeral: true });

  const conn = getConn();

  if (!conn) {
    await interaction.editReply({ embeds: [noConnEmbed] });
    return;
  }

  const userID = interaction.options.getUser('tag_or_id')!.id;
  const timeoutDuration = interaction.options.getNumber('duration')!;
  const timeoutReason = interaction.options.getString('reason')!;

  const discordUser = await interaction.guild.members.fetch(userID);
  const moderator = interaction.user;
  const currentDate = new Date();
  const formattedDate: string = moment(currentDate).utcOffset(0).format();
  const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

  //Try to timeout the user

  try {
    await discordUser.timeout(timeoutDuration, timeoutReason);
  } catch (error) {
    await interaction.editReply({ embeds: [failedTimeoutEmbed(discordUser.user, error)] });
    Logger.error(error);
    return;
  }

  if (discordUser.isCommunicationDisabled()) {
    //Timeout was successful
    await interaction.editReply({ embeds: [timeoutEmbed(discordUser.user)] });
    //Try and send a Dm to the user
    try {
      await discordUser.send({
        embeds: [
          DMEmbed(
            moderator,
            timeoutDuration.toString(),
            timeoutReason,
            interaction.guild,
            discordUser.communicationDisabledUntil,
          ),
        ],
      });
    } catch {
      if (modLogsChannel) {
        await interaction.followUp({ embeds: [DMFailed(discordUser.user)], ephemeral: true });
      }
    }
    //Send a mod log to the mod logs channel
    try {
      await modLogsChannel.send({
        embeds: [modLogEmbed(moderator, discordUser.user, timeoutReason, timeoutDuration.toString(), formattedDate)],
      });
    } catch {
      await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
      return;
    }
    //Log to the DB

    Logger.info('Starting Infraction process');

    const newInfraction = {
      infractionType: 'Timeout',
      moderatorID: moderator.id,
      reason: timeoutReason,
      duration: durationInEnglish(timeoutDuration),
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
  } else {
    await interaction.followUp({ embeds: [communicationNotDisabledEmbed(discordUser.user)], ephemeral: true });
  }
}
