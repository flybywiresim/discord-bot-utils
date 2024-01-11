import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandContent, PrefixCommandVersion, PrefixCommand, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Set Content - No Connection',
    description: 'Could not connect to the database. Unable to set the prefix command content.',
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Set Content - No Command',
    description: `Failed to set command content for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const noVersionEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Set Content - No Version',
    description: `Failed to set command content for version ${version} as the version does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const failedEmbed = (command: string, version: string) => makeEmbed({
    title: 'Prefix Commands - Set Content - Failed',
    description: `Failed to set command content for command ${command} and version ${version}.`,
    color: Colors.Red,
});

const successEmbed = (command: string, version: string, contentId: string) => makeEmbed({
    title: `Prefix command content set for command ${command} and version ${version}. Content ID: ${contentId}`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, version: string, title: string, content: string, image: string, commandId: string, versionId: string, contentId: string) => makeEmbed({
    title: 'Prefix command content set',
    fields: [
        {
            name: 'Command',
            value: command,
        },
        {
            name: 'Version',
            value: version,
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
    title: 'Prefix Commands - Set Content - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleSetPrefixCommandContent(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command')!;
    const version = interaction.options.getString('version')!;
    const title = interaction.options.getString('title')!;
    const content = interaction.options.getString('content') || '';
    const image = interaction.options.getString('image') || '';
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    let foundCommand = await PrefixCommand.find({ name: command });
    if (!foundCommand || foundCommand.length !== 1) {
        foundCommand = await PrefixCommand.find({ aliases: { $in: [command] } });
    }
    if (!foundCommand || foundCommand.length !== 1) {
        await interaction.followUp({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }

    const { id: commandId } = foundCommand[0];
    let versionId = '';
    let foundVersion = null;
    if (version === 'GENERIC' || version === 'generic') {
        versionId = 'GENERIC';
    } else {
        foundVersion = await PrefixCommandVersion.find({ name: version });
        if (foundVersion && foundVersion.length === 1) {
            versionId = foundVersion[0].id;
        } else {
            await interaction.followUp({ embeds: [noVersionEmbed(version)], ephemeral: true });
            return;
        }
    }

    let foundContent = await PrefixCommandContent.findOne({ commandId, versionId });
    if (!foundContent) {
        foundContent = new PrefixCommandContent();
        foundContent.commandId = commandId;
        foundContent.versionId = versionId;
    }
    foundContent.title = title;
    foundContent.content = content;
    foundContent.image = image;

    try {
        await foundContent.save();
        await interaction.followUp({ embeds: [successEmbed(command, version, foundContent.id)], ephemeral: true });
        if (modLogsChannel) {
            try {
                await modLogsChannel.send({ embeds: [modLogEmbed(moderator, command, version, title, content, image, commandId, versionId, foundContent.id)] });
            } catch (error) {
                Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
            }
        }
    } catch (error) {
        Logger.error(`Failed to set prefix command content for command ${command} and version ${version}: ${error}`);
        await interaction.followUp({ embeds: [failedEmbed(command, version)], ephemeral: true });
    }
}
