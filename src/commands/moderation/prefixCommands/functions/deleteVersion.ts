import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandVersion, Logger, makeEmbed, PrefixCommandChannelDefaultVersion, clearSinglePrefixCommandVersionCache, PrefixCommand, refreshSinglePrefixCommandCache, clearSinglePrefixCommandChannelDefaultVersionCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Delete Version - No Connection',
    description: 'Could not connect to the database. Unable to delete the prefix command version.',
    color: Colors.Red,
});

const contentPresentEmbed = makeEmbed({
    title: 'Prefix Commands - Delete Version - Content Present',
    description: 'There is content present for this command version. Please delete the content first, or use the `force` option to delete the command version and all the command contents for the version.',
    color: Colors.Red,
});

const channelDefaultVersionPresentEmbed = makeEmbed({
    title: 'Prefix Commands - Delete Version - Default Channel Versions Present',
    description: 'There is one or more channel with this version selected as its default version. Please change or unset the default version for those channels first, or use the `force` option to delete the command version and all the default channel versions referencing it (making them default back to the GENERIC version).',
    color: Colors.Red,
});

const failedEmbed = (versionId: string) => makeEmbed({
    title: 'Prefix Commands - Delete Version - Failed',
    description: `Failed to delete the prefix command version with id ${versionId}.`,
    color: Colors.Red,
});

const doesNotExistsEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Delete Version - Does not exist',
    description: `The prefix command version ${version} does not exists. Can not delete it.`,
    color: Colors.Red,
});

const successEmbed = (version: string, versionId: string) => makeEmbed({
    title: `Prefix command version ${version} (${versionId}) was deleted successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, version: string, emoji: string, alias: string, enabled: boolean, versionId: string) => makeEmbed({
    title: 'Prefix command version deleted',
    fields: [
        {
            name: 'Version',
            value: version,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
        {
            name: 'Emoji',
            value: emoji,
        },
        {
            name: 'Alias',
            value: alias,
        },
        {
            name: 'Enabled',
            value: enabled ? 'Yes' : 'No',
        },
    ],
    footer: { text: `Version ID: ${versionId}` },
    color: Colors.Red,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Delete Version - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleDeletePrefixCommandVersion(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const version = interaction.options.getString('version')!;
    const force = interaction.options.getBoolean('force') || false;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const existingVersion = await PrefixCommandVersion.findOne({ name: version });
    if (!existingVersion) {
        await interaction.followUp({ embeds: [doesNotExistsEmbed(version)], ephemeral: true });
        return;
    }
    const { id: versionId } = existingVersion;
    // Find all PrefixCommands with content where version ID == versionId
    const foundCommandsWithContent = await PrefixCommand.find({ 'contents.versionId': versionId });
    if (foundCommandsWithContent && foundCommandsWithContent.length > 0 && !force) {
        await interaction.followUp({ embeds: [contentPresentEmbed], ephemeral: true });
        return;
    }
    const foundChannelDefaultVersions = await PrefixCommandChannelDefaultVersion.find({ versionId });
    if (foundChannelDefaultVersions && foundChannelDefaultVersions.length > 0 && !force) {
        await interaction.followUp({ embeds: [channelDefaultVersionPresentEmbed], ephemeral: true });
        return;
    }

    if (existingVersion) {
        const { name, emoji, enabled, alias } = existingVersion;
        try {
            if (foundCommandsWithContent && force) {
                for (const command of foundCommandsWithContent) {
                    const { _id: commandId } = command;
                    // eslint-disable-next-line no-await-in-loop
                    const updatedCommand = await PrefixCommand.findOneAndUpdate({ _id: commandId }, { $pull: { contents: { versionId } } }, { new: true });
                    if (updatedCommand) {
                        // eslint-disable-next-line no-await-in-loop
                        await refreshSinglePrefixCommandCache(command, updatedCommand);
                    }
                }
            }
            if (foundChannelDefaultVersions && force) {
                for (const channelDefaultVersion of foundChannelDefaultVersions) {
                    // eslint-disable-next-line no-await-in-loop
                    await clearSinglePrefixCommandChannelDefaultVersionCache(channelDefaultVersion);
                    // eslint-disable-next-line no-await-in-loop
                    await channelDefaultVersion.deleteOne();
                }
            }
            await clearSinglePrefixCommandVersionCache(existingVersion);
            await existingVersion.deleteOne();
            await interaction.followUp({ embeds: [successEmbed(name || '', versionId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name || '', emoji || '', alias || '', enabled || false, versionId)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to delete a prefix command version with id ${versionId}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(versionId)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistsEmbed(versionId)], ephemeral: true });
    }
}
