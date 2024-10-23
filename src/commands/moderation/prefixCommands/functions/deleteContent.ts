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

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Delete Content - No Command',
    description: `Failed to delete command content for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const noVersionEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Delete Content - No Version',
    description: `Failed to delete command content for version ${version} as the version does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const failedEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Delete Content - Failed',
    description: `Failed to delete the prefix command content with version ${version}.`,
    color: Colors.Red,
});

const successEmbed = (command: string, version: string) => makeEmbed({
    title: `Prefix command content for command ${command} and version ${version} was deleted successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, commandName: string, versionName: string, title: string, content: string, image: string) => makeEmbed({
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
    color: Colors.Red,
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

    const foundCommand = await PrefixCommand.findOne({ name: command });
    if (!foundCommand) {
        await interaction.followUp({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }
    let versionId = '';
    let foundVersions = null;
    if (version === 'GENERIC' || version === 'generic') {
        versionId = 'GENERIC';
    } else {
        foundVersions = await PrefixCommandVersion.find({ name: version });
        if (foundVersions && foundVersions.length === 1) {
            [{ _id: versionId }] = foundVersions;
        } else {
            await interaction.followUp({ embeds: [noVersionEmbed(version)], ephemeral: true });
            return;
        }
    }
    const existingContent = foundCommand.contents.find((content) => content.versionId.toString() === versionId.toString());

    if (foundCommand && existingContent) {
        const { title, content, image } = existingContent;
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
            foundCommand.contents.find((con) => con.versionId.toString() === versionId.toString())?.deleteOne();
            await foundCommand.save();
            await refreshSinglePrefixCommandCache(foundCommand, foundCommand);
            await interaction.followUp({ embeds: [successEmbed(`${commandName}`, `${versionName}`)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, `${commandName}`, `${versionName}`, `${title}`, `${content}`, `${image}`)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to delete a prefix command content with version ${version}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(version)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [noContentEmbed(command, version)], ephemeral: true });
    }
}
