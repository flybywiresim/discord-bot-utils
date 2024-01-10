import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandVersion, Logger, makeEmbed } from '../../../../lib';

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

const failedEmbed = (versionId: string) => makeEmbed({
    title: 'Prefix Commands - Delete Version - Failed',
    description: `Failed to delete the prefix command version with id ${versionId}.`,
    color: Colors.Red,
});

const doesNotExistsEmbed = (versionId: string) => makeEmbed({
    title: 'Prefix Commands - Delete Version - Does not exist',
    description: `The prefix command version with id ${versionId} does not exists. Can not delete it.`,
    color: Colors.Red,
});

const successEmbed = (version: string, versionId: string) => makeEmbed({
    title: `Prefix command version ${version} (${versionId}) was deleted successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, version: string, emoji: string, enabled: boolean, versionId: string) => makeEmbed({
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

    const versionId = interaction.options.getString('id')!;
    const force = interaction.options.getBoolean('force') || false;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const existingVersion = await PrefixCommandVersion.findById(versionId);
    const foundContents = await PrefixCommandVersion.find({ versionId });
    if (foundContents && foundContents.length > 0 && !force) {
        await interaction.followUp({ embeds: [contentPresentEmbed], ephemeral: true });
        return;
    }

    if (existingVersion) {
        const { name, emoji, enabled } = existingVersion;
        try {
            await existingVersion.deleteOne();
            if (foundContents && force) {
                for (const content of foundContents) {
                    // eslint-disable-next-line no-await-in-loop
                    await content.deleteOne();
                }
            }
            await interaction.followUp({ embeds: [successEmbed(name || '', versionId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name || '', emoji || '', enabled || false, versionId)] });
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
