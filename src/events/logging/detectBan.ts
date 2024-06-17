//This detects non bot bans and sends a message to the mod logs channel

import { AuditLogEvent, bold, Colors, GuildBan, TextChannel, User } from 'discord.js';
import moment from 'moment/moment';
import mongoose from 'mongoose';
import { constantsConfig, event, Events, Infraction, Logger, makeEmbed, makeLines } from '../../lib';

const MAX_RETRIES = 5;
const SLEEP_TIMER = 0.5 * 1000;

const noLogEmbed = (user: User, guildName: string) =>
  makeEmbed({
    color: Colors.Red,
    author: {
      name: `[BANNED] ${user.tag}`,
      iconURL: user.displayAvatarURL(),
    },
    description: makeLines([
      `${user.tag} was banned from ${guildName} but no audit log could be found.`,
      '',
      bold('NOTE - This was a non bot ban.'),
      '',
      `Please remember to send the user the reason they were banned and the ban appeal form - ${process.env.BAN_APPEAL_URL}`,
    ]),
    footer: { text: `User ID: ${user.id}` },
  });

const modLogEmbed = (user: User, executor: User, reason: string, formattedDate: string) =>
  makeEmbed({
    color: Colors.Red,
    author: {
      name: `[BANNED] ${user.tag}`,
      iconURL: user.displayAvatarURL(),
    },
    description: makeLines([
      bold('NOTE - This was a non bot ban.'),
      '',
      `Please remember to send the user the reason they were banned and the ban appeal form - ${process.env.BAN_APPEAL_URL}`,
    ]),
    fields: [
      {
        name: 'User',
        value: `${user}`,
      },
      {
        name: 'Moderator',
        value: `${executor}`,
      },
      {
        name: 'Reason',
        value: reason || 'No reason provided',
      },
      {
        name: 'Days of messages deleted',
        value: 'Unavailable with a non bot ban',
      },
      {
        name: 'Date',
        value: formattedDate,
      },
    ],
    footer: { text: `User ID: ${user.id}` },
  });

const userBannedIncompleteEmbed = (user: User, formattedDate: string) =>
  makeEmbed({
    color: Colors.Red,
    author: {
      name: `[BANNED] ${user.tag}`,
      iconURL: user.displayAvatarURL(),
    },
    description: makeLines([
      bold('NOTE - This was a non bot ban.'),
      '',
      `Please remember to send the user the reason they were banned and the ban appeal form - ${process.env.BAN_APPEAL_URL}`,
    ]),
    fields: [
      {
        name: 'Member',
        value: user.tag,
      },
      {
        name: 'Moderator',
        value: 'Unavailable - Audit log incomplete',
      },
      {
        name: 'Reason',
        value: 'Unavailable - Audit log incomplete',
      },
      {
        name: 'Days of messages deleted',
        value: 'Unavailable with a non bot ban',
      },
      {
        name: 'Date',
        value: formattedDate,
      },
    ],
    footer: { text: `User ID: ${user.id}` },
  });

const logFailed = makeEmbed({
  title: 'Non Bot Ban - Failed to log',
  description: 'Failed to log the ban to the database, audit log could have been unavailable.',
  color: Colors.Red,
});

export default event(Events.GuildBanAdd, async (_, msg) => {
  Logger.debug('Starting Ban Handler');

  const guildBanAdd = msg as GuildBan;

  if (guildBanAdd.guild === null) {
    // DMs
    return;
  }

  const modLogsChannel = (await guildBanAdd.guild.channels.resolve(
    constantsConfig.channels.MOD_LOGS,
  )) as TextChannel | null;
  if (!modLogsChannel) {
    // Exit as can't post
    return;
  }

  const currentDate = new Date();
  const formattedDate: string = moment(currentDate).utcOffset(0).format();

  let executor;
  let reason;
  let target;
  let retryCount = MAX_RETRIES;
  do {
    Logger.debug(`Ban Handler - Finding Audit Log entry retries left: ${retryCount}`);
    if (retryCount < MAX_RETRIES) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((f) => setTimeout(f, SLEEP_TIMER));
    }
    // eslint-disable-next-line no-await-in-loop
    const fetchedLogs = await guildBanAdd.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    });
    const banLog = fetchedLogs.entries.first();
    if (banLog) {
      ({ executor, reason, target } = banLog);
    }

    retryCount--;
  } while ((!target || target.id !== guildBanAdd.user.id) && retryCount > 0);

  if (!target) {
    await modLogsChannel.send({ embeds: [noLogEmbed(guildBanAdd.user, guildBanAdd.guild.name)] });
    return;
  }
  if (target.id !== guildBanAdd.user.id) {
    await modLogsChannel.send({ embeds: [userBannedIncompleteEmbed(guildBanAdd.user, formattedDate)] });
    return;
  }
  if (executor && !constantsConfig.modLogExclude.includes(executor.id)) {
    await modLogsChannel.send({
      content: executor.toString(),
      embeds: [modLogEmbed(guildBanAdd.user, executor, reason as string, formattedDate)],
    });

    //Log to the DB
    Logger.info('Starting Infraction process');

    const newInfraction = {
      infractionType: 'Ban',
      moderatorID: executor ? executor.id : 'Unavailable',
      reason: `This was a non bot ban: ${reason as string}`,
      date: currentDate,
      infractionID: new mongoose.Types.ObjectId(),
    };

    let userData = await Infraction.findOne({ userID: target.id });

    Logger.info(userData);

    if (!userData) {
      userData = new Infraction({
        userID: target.id,
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
      await modLogsChannel.send({ embeds: [logFailed] });
      Logger.error(error);
    }
  }

  Logger.debug('Ban Handler - Finished');
});
