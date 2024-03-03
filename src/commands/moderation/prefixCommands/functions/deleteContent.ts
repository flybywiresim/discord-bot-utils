import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, Logger, makeEmbed, PrefixCommand, PrefixCommandVersion } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Delete Content - No Connection',
    description: 'Could not connect to the database. Unable to delete the prefix command content.',
    color: Colors.Red,
});

const noContentEmbed = (contentId: string) => makeEmbed({
    title: 'Prefix Commands - Delete Content - No Content',
    description: `Failed to delete command content with ID ${contentId} as the content does not exist.`,
    color: Colors.Red,
});

const failedEmbed = (contentId: string) => makeEmbed({
    title: 'Prefix Commands - Delete Content - Failed',
    description: `Failed to delete the prefix command content with id ${contentId}.`,
    color: Colors.Red,
});

const successEmbed = (command: string, version: string, contentId: string) => makeEmbed({
    title: `Prefix command content for command ${command} and version ${version} (Content ID: ${contentId}) was deleted successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, commandName: string, versionName: string, title: string, content: string, image: string, commandId: string, versionId: string, contentId: string) => makeEmbed({
    title: 'Prefix command content delete',
    fields: [
        {
            name: 'Command',
            value: commandName,
        },
        {
            name: 'Version',
            value: versionName,
        },
        {
            name: 'Title',
            value: title,
        },
        {
            name: 'Content',
            value: content,
        },
        {
            name: 'Image',
            value: image,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
    ],
    footer: { text: `Command ID: ${commandId} - Version ID: ${versionId} - Content ID: ${contentId}` },
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Delete Content - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleDeletePrefixCommandContent(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const contentId = interaction.options.getString('id')!;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const foundCommand = await PrefixCommand.findOne({ 'contents._id': contentId });
    const existingContent = foundCommand?.contents.id(contentId) || null;

    if (foundCommand && existingContent) {
        const { versionId, title, content, image } = existingContent;
        const { name: commandName } = foundCommand;
        let versionName = '';
        if (versionId !== 'GENERIC') {
            const foundVersion = await PrefixCommandVersion.findById(versionId);
            if (!foundVersion) {
                return;
            }
            versionName = foundVersion.name || '';
        }
        try {
            await existingContent.deleteOne();
            await foundCommand.save();
            await interaction.followUp({ embeds: [successEmbed(`${commandName}`, `${versionName}`, `${contentId}`)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, `${commandName}`, `${versionName}`, `${title}`, `${content}`, `${image}`, `${foundCommand.id}`, `${versionId}`, `${contentId}`)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to delete a prefix command content with id ${contentId}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(contentId)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [noContentEmbed(contentId)], ephemeral: true });
    }
}
