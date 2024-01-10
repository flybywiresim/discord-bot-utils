import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { getConn, PrefixCommandContent, PrefixCommandVersion, PrefixCommand, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Show Content - No Connection',
    description: 'Could not connect to the database. Unable to show the prefix command content.',
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Show Content - No Command',
    description: `Failed to show command content for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const noVersionEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Show Content - No Version',
    description: `Failed to show command content for version ${version} as the version does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const noContentEmbed = (command: string, version: string) => makeEmbed({
    title: 'Prefix Commands - Show Content - No Content',
    description: `Failed to show command content for command ${command} and version ${version} as the content does not exist.`,
    color: Colors.Red,
});

const failedEmbed = (command: string, version: string) => makeEmbed({
    title: 'Prefix Commands - Show Content - Failed',
    description: `Failed to show command content for command ${command} and version ${version}.`,
    color: Colors.Red,
});

const contentEmbed = (command: string, version: string, title: string, content: string, image: string, commandId: string, versionId: string, contentId: string) => makeEmbed({
    title: `Prefix Commands - Show Content - ${command} - ${version}`,
    fields: [
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
    ],
    footer: { text: `Command ID: ${commandId} - Version ID: ${versionId} - Content ID: ${contentId}` },
    color: Colors.Green,
});

export async function handleShowPrefixCommandContent(interaction: ChatInputCommandInteraction<'cached'>) {
    const conn = getConn();
    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command') || '';
    const version = interaction.options.getString('version') || '';
    let foundCommand = await PrefixCommand.find({ name: command });
    if (!foundCommand || foundCommand.length > 1) {
        foundCommand = await PrefixCommand.find({ aliases: { $in: [command] } });
    }
    if (!foundCommand || foundCommand.length > 1) {
        await interaction.reply({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }

    const { id: commandId } = foundCommand[0];
    let versionId = '';
    if (version === 'GENERIC' || version === 'generic') {
        versionId = 'GENERIC';
    } else {
        const foundVersions = await PrefixCommandVersion.find({ name: version });
        if (foundVersions && foundVersions.length === 1) {
            const [foundVersion] = foundVersions;
            ({ id: versionId } = foundVersion);
        } else {
            await interaction.reply({ embeds: [noVersionEmbed(version)], ephemeral: true });
            return;
        }
    }

    const foundContent = await PrefixCommandContent.findOne({ commandId, versionId });
    if (!foundContent) {
        await interaction.reply({ embeds: [noContentEmbed(command, version)], ephemeral: true });
        return;
    }
    const { id: contentId, title, content, image } = foundContent;
    try {
        await interaction.reply({ embeds: [contentEmbed(command, version, `${title}`, `${content}`, `${image}`, `${commandId}`, `${versionId}`, `${contentId}`)], ephemeral: false });
    } catch (error) {
        Logger.error(`Failed to show prefix command content for command ${command} and version ${version}: ${error}`);
        await interaction.reply({ embeds: [failedEmbed(command, version)], ephemeral: true });
    }
}
