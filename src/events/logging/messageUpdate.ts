import { Colors, TextChannel } from 'discord.js';
import { constantsConfig, event, Events, imageBaseUrl, Logger, makeEmbed } from '../../lib';

const FEATURE_NOT_AVAIL = "(can't show embeds or images)";

export default event(Events.MessageUpdate, async (_, oldMessage, newMessage) => {
    try {
        if (oldMessage.guild === null || oldMessage.author === null || newMessage.author === null) {
            // DMs
            return;
        }

        if (oldMessage.content === null) {
            // Old Message
            return;
        }

        if (newMessage.content === null) {
            // Message was deleted
            return;
        }

        const userLogsChannel = oldMessage.guild.channels.resolve(constantsConfig.channels.USER_LOGS);

        const MAX_MESSAGE_LENGTH = 1024;

        let oldMessageContent = oldMessage.content;
        let newMessageContent = newMessage.content;

        let originalMessageFieldTitle = 'Original Message';
        let editedMessageFieldTitle = 'Edited Message';

        if (oldMessageContent.length > MAX_MESSAGE_LENGTH) {
            oldMessageContent = `${oldMessageContent.slice(0, MAX_MESSAGE_LENGTH - 9)}...`;
            originalMessageFieldTitle = 'Original Message (truncated)';
        }

        if (newMessageContent.length > MAX_MESSAGE_LENGTH) {
            newMessageContent = `${newMessageContent.slice(0, MAX_MESSAGE_LENGTH - 9)}...`;
            editedMessageFieldTitle = 'Edited Message (truncated)';
        }

        if (userLogsChannel && !constantsConfig.userLogExclude.includes(oldMessage.author.id)) {
            const messageUpdateEmbed = makeEmbed({
                color: Colors.Orange,
                thumbnail: { url: `${imageBaseUrl}/moderation/message_edited.png` },
                author: {
                    name: oldMessage.author.tag,
                    iconURL: oldMessage.author.displayAvatarURL(),
                },
                fields: [
                    { name: 'Author', value: `${oldMessage.author}`, inline: true },
                    { name: 'Channel', value: `${oldMessage.channel}`, inline: true },
                    {
                        name: originalMessageFieldTitle,
                        value: oldMessageContent ? `\`\`\`${oldMessageContent}\`\`\`` : FEATURE_NOT_AVAIL,
                        inline: false,
                    },
                    {
                        name: editedMessageFieldTitle,
                        value: newMessageContent ? `\`\`\`${newMessageContent}\`\`\`` : FEATURE_NOT_AVAIL,
                        inline: false,
                    },
                ],
                footer: { text: `User ID: ${oldMessage.author.id}` },
            });
            await userLogsChannel.send({ embeds: [messageUpdateEmbed] });
        }
    } catch (error) {
        Logger.error(error);
    }
});
