import moment from 'moment';
import { AuditLogEvent, Colors, TextChannel } from 'discord.js';
import { constantsConfig, event, Events, imageBaseUrl, Logger, makeEmbed } from '../../lib';

const CONTENT_NOT_AVAIL = 'Unable to find content or embeds.';

export default event(Events.MessageDelete, async (_, msg) => {
  try {
    if (msg.guild === null || msg.author === null) {
      // DMs
      return;
    }

    if (msg.content === null || msg.content.trim() === '') {
      // Old Message or empty content
      return;
    }

    const fetchedLogs = await msg.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete,
    });
    const deletionLog = fetchedLogs.entries.first();
    const currentDate = new Date();
    const formattedDate: string = moment(currentDate).utcOffset(0).format('DD, MM, YYYY, HH:mm:ss');
    const userLogsChannel = msg.guild.channels.resolve(constantsConfig.channels.USER_LOGS) as TextChannel | null;
    const messageEmbeds = msg.embeds.length > 0 ? msg.embeds : [];
    const messageComponents = [];
    if (msg.content) {
      messageComponents.push(msg.content);
    }
    if (msg.attachments) {
      msg.attachments.forEach((attachment) => {
        if (attachment.url || attachment.proxyURL) {
          messageComponents.push(attachment.url ? attachment.url : attachment.proxyURL);
        }
      });
    }
    for (const messageEmbed of messageEmbeds) {
      const { image, fields } = messageEmbed;
      if (image) {
        messageComponents.push(`<${image.url}>`);
      }
      for (const field of fields) {
        const { name, value } = field;
        if (name && value) {
          messageComponents.push(`${name}: ${value}`);
        }
      }
    }

    const MAX_MESSAGE_LENGTH = 1024;

    let messageContent = messageComponents.join('\n');

    let deletedMessageFieldTitle = 'Deleted Message';

    if (messageContent.length > MAX_MESSAGE_LENGTH) {
      messageContent = `${messageComponents.join('\n').slice(0, MAX_MESSAGE_LENGTH - 3)}...`;
      deletedMessageFieldTitle = 'Deleted Message (truncated)';
    }

    const messageReference = msg.reference ? await msg.fetchReference() : null;
    const messageDeleteEmbed = makeEmbed({
      color: Colors.Red,
      thumbnail: { url: `${imageBaseUrl}/moderation/message_deleted.png` },
      author: {
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      },
      fields: [
        {
          name: 'Date',
          value: formattedDate,
          inline: true,
        },
        {
          name: 'Author',
          value: `${msg.author}`,
          inline: true,
        },
        {
          name: 'Channel',
          value: `${msg.channel}`,
          inline: true,
        },
        {
          name: 'Reply to',
          value: messageReference ? `${messageReference.url}` : 'None',
          inline: true,
        },
        {
          name: 'Deleted by',
          value:
            deletionLog && deletionLog.target.id === msg.author.id
              ? `${deletionLog.executor}`
              : 'No audit log was found, message was either deleted by author, or a bot',
          inline: false,
        },
        {
          name: deletedMessageFieldTitle,
          value: messageContent ? `${messageContent}` : CONTENT_NOT_AVAIL,
          inline: false,
        },
      ],
      footer: { text: `User ID: ${msg.author.id}` },
    });

    if (userLogsChannel && !constantsConfig.userLogExclude.includes(msg.author!.id)) {
      await userLogsChannel.send({ embeds: [messageDeleteEmbed] });
    }
  } catch (error) {
    Logger.error(error);
  }
});
