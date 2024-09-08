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

    const foundVersion = await PrefixCommandVersion.findOne({ name: version });
    const { versionId } = foundVersion ?? { versionId: 'GENERIC' };
    const foundCommand = await PrefixCommand.findOne({ name: command });
    const [existingContent] = foundCommand?.contents.filter((content) => content.versionId === versionId) ?? [];

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
            foundCommand.contents.find((con) => con.versionId === versionId)?.deleteOne();
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
