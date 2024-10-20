import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandVersion, Logger, makeEmbed, refreshSinglePrefixCommandVersionCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Modify Version - No Connection',
    description: 'Could not connect to the database. Unable to modify the prefix command version.',
    color: Colors.Red,
});

const failedEmbed = (versionId: string) => makeEmbed({
    title: 'Prefix Commands - Modify Version - Failed',
    description: `Failed to modify the prefix command version with id ${versionId}.`,
    color: Colors.Red,
});

const wrongFormatEmbed = (invalidString: string) => makeEmbed({
    title: 'Prefix Commands - Modify Version - Wrong format',
    description: `The name and alias of a version can only contain alphanumerical characters, underscores and dashes. "${invalidString}" is invalid.`,
    color: Colors.Red,
});

const doesNotExistsEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Modify Version - Does not exist',
    description: `The prefix command version ${version} does not exists. Can not modify it.`,
    color: Colors.Red,
});

const successEmbed = (version: string, versionId: string) => makeEmbed({
    title: `Prefix command version ${version} (${versionId}) was modified successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, version: string, emoji: string, alias: string, enabled: boolean, versionId: string) => makeEmbed({
    title: 'Prefix command version modified',
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
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Modified Version - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleModifyPrefixCommandVersion(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const version = interaction.options.getString('version')!;
    const name = interaction.options.getString('name') || '';
    const emoji = interaction.options.getString('emoji') || '';
    const alias = interaction.options.getString('alias')?.toLowerCase() || '';
    const enabled = interaction.options.getBoolean('is_enabled');
    const moderator = interaction.user;

    const nameRegex = /^[\w-]+$/;
    if (name && !nameRegex.test(name)) {
        await interaction.followUp({ embeds: [wrongFormatEmbed(name)], ephemeral: true });
        return;
    }
    if (alias && !nameRegex.test(alias)) {
        // eslint-disable-next-line no-await-in-loop
        await interaction.followUp({ embeds: [wrongFormatEmbed(alias)], ephemeral: true });
        return;
    }

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const existingVersion = await PrefixCommandVersion.findOne({ name: version });

    if (existingVersion) {
        const { id: versionId } = existingVersion;
        const oldVersion = existingVersion.$clone();
        existingVersion.name = name || existingVersion.name;
        existingVersion.emoji = emoji || existingVersion.emoji;
        existingVersion.alias = alias || existingVersion.alias;
        existingVersion.enabled = enabled !== null ? enabled : existingVersion.enabled;
        try {
            await existingVersion.save();
            const { name, emoji, alias, enabled } = existingVersion;
            await refreshSinglePrefixCommandVersionCache(oldVersion, existingVersion);
            await interaction.followUp({ embeds: [successEmbed(name, versionId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, emoji, alias, enabled || false, versionId)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to modify a prefix command version with id ${versionId}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(versionId)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistsEmbed(version)], ephemeral: true });
    }
}
