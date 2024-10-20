import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandVersion, Logger, makeEmbed, loadSinglePrefixCommandVersionToCache, PrefixCommand } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Add Version - No Connection',
    description: 'Could not connect to the database. Unable to add the prefix command version.',
    color: Colors.Red,
});

const failedEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Add Version - Failed',
    description: `Failed to add the prefix command version ${version}.`,
    color: Colors.Red,
});

const wrongFormatEmbed = (invalidString: string) => makeEmbed({
    title: 'Prefix Commands - Add Version - Wrong format',
    description: `The name and alias of a version can only contain alphanumerical characters, underscores and dashes. "${invalidString}" is invalid.`,
    color: Colors.Red,
});

const alreadyExistsEmbed = (version: string, reason: string) => makeEmbed({
    title: 'Prefix Commands - Add Version - Already exists',
    description: `The prefix command version ${version} already exists: ${reason}`,
    color: Colors.Red,
});

const successEmbed = (version: string) => makeEmbed({
    title: `Prefix command version ${version} was added successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, version: string, emoji: string, alias: string, enabled: boolean, versionId: string) => makeEmbed({
    title: 'Prefix command version added',
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
    title: 'Prefix Commands - Add Version - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleAddPrefixCommandVersion(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const name = interaction.options.getString('name')!;
    const emoji = interaction.options.getString('emoji')!;
    const alias = interaction.options.getString('alias')!.toLowerCase();
    const enabled = interaction.options.getBoolean('is_enabled') || false;
    const moderator = interaction.user;

    const nameRegex = /^[\w-]+$/;
    if (!nameRegex.test(name)) {
        await interaction.followUp({ embeds: [wrongFormatEmbed(name)], ephemeral: true });
        return;
    }
    if (!nameRegex.test(alias)) {
        // eslint-disable-next-line no-await-in-loop
        await interaction.followUp({ embeds: [wrongFormatEmbed(alias)], ephemeral: true });
        return;
    }

    // Check if a command or version exists with the same name or alias
    const foundCommandName = await PrefixCommand.findOne({
        $or: [
            { name: alias },
            { aliases: alias },
        ],
    });
    if (foundCommandName) {
        await interaction.followUp({ embeds: [alreadyExistsEmbed(name, `${alias} already exists as a command or alias.`)], ephemeral: true });
        return;
    }
    const foundVersion = await PrefixCommandVersion.findOne({
        $or: [
            { name },
            { alias },
        ],
    });
    if (foundVersion || name.toLowerCase() === 'generic' || alias === 'generic') {
        await interaction.followUp({ embeds: [alreadyExistsEmbed(name, `${alias} already exists as a version alias.`)], ephemeral: true });
        return;
    }

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const prefixCommandVersion = new PrefixCommandVersion({
        name,
        emoji,
        enabled,
        alias,
    });
    try {
        await prefixCommandVersion.save();
        await loadSinglePrefixCommandVersionToCache(prefixCommandVersion);
        await interaction.followUp({ embeds: [successEmbed(name)], ephemeral: true });
        if (modLogsChannel) {
            try {
                await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, emoji, alias, enabled, prefixCommandVersion.id)] });
            } catch (error) {
                Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
            }
        }
    } catch (error) {
        Logger.error(`Failed to add a prefix command category ${name}: ${error}`);
        await interaction.followUp({ embeds: [failedEmbed(name)], ephemeral: true });
    }
}
