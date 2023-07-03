import { Colors, TextChannel } from 'discord.js';
import { constantsConfig, event, Events, imageBaseUrl, makeEmbed } from '../../lib';

const FEATURE_NOT_AVAIL = '(can\'t show embeds or images)';

export default event(Events.MessageUpdate, async (_, oldMessage, newMessage) => {
    if (oldMessage.guild === null || oldMessage.author === null || newMessage.author === null) {
        // DMs
        return;
    }

    if (oldMessage.content === null) {
        // Old Message
        return;
    }

    const userLogsChannel = oldMessage.guild.channels.resolve(constantsConfig.channels.USER_LOGS) as TextChannel | null;

    if (userLogsChannel && !constantsConfig.userLogExclude.includes(oldMessage.author!.id)) {
        const messageUpdateEmbed = makeEmbed({
            color: Colors.Orange,
            thumbnail: { url: `${imageBaseUrl}/moderation/message_updated.png` },
            author: {
                name: oldMessage.author.tag,
                iconURL: oldMessage.author.displayAvatarURL(),
            },
            fields: [
                { name: 'Author', value: `${oldMessage.author}`, inline: true },
                { name: 'Channel', value: `${oldMessage.channel}`, inline: true },
                { name: 'Original Message', value: oldMessage.content ? `\`\`\`${oldMessage.content}\`\`\`` : FEATURE_NOT_AVAIL, inline: false },
                { name: 'Edited Message', value: newMessage.content ? `\`\`\`${newMessage.content}\`\`\`` : FEATURE_NOT_AVAIL, inline: false },
            ],
            footer: { text: `User ID: ${oldMessage.author.id}` },
        });
        await userLogsChannel.send({ embeds: [messageUpdateEmbed] });
    }
});
