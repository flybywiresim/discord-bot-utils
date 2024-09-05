import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, Logger, makeEmbed, PrefixCommand, PrefixCommandVersion, refreshSinglePrefixCommandCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Delete Content - No Connection',
    description: 'Could not connect to the database. Unable to delete the prefix command content.',
    color: Colors.Red,
});

const noContentEmbed = (command: string, version: string) => makeEmbed({
    title: 'Prefix Commands - Delete Content - No Content',
    description: `Failed to delete command content for command ${command} and version ${version} as the content does not exist.`,
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

    const command = interaction.options.getString('command')!;
    const version = interaction.options.getString('version')!;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    let versionId = 'GENERIC';
    if (version !== 'GENERIC') {
        const foundVersion = await PrefixCommandVersion.findOne({ name: version });
        versionId = foundVersion?.id;
    }
    const foundCommand = await PrefixCommand.findOne({ 'name': command, 'contents.versionId': versionId });
    const existingContent = foundCommand?.contents.filter((content) => content.versionId === versionId)[0] || null;

    if (foundCommand && existingContent) {
        const { id: contentId, title, content, image } = existingContent;
        const { name: commandName, aliases: commandAliases } = foundCommand;
        let versionName = '';
        if (versionId !== 'GENERIC') {
            const foundVersion = await PrefixCommandVersion.findById(versionId);
            if (!foundVersion) {
                return;
            }
            versionName = foundVersion.name || '';
        }
        try {
            foundCommand.contents.id(contentId)?.deleteOne();
            await foundCommand.save();
            await refreshSinglePrefixCommandCache(commandName, foundCommand.toObject(), commandName, commandAliases);
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
        await interaction.followUp({ embeds: [noContentEmbed(command, version)], ephemeral: true });
    }
}
