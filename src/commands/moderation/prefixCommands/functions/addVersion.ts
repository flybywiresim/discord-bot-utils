import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandVersion, Logger, makeEmbed } from '../../../../lib';

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

const alreadyExistsEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Add Version - Already exists',
    description: `The prefix command version ${version} already exists. Not adding again.`,
    color: Colors.Red,
});

const successEmbed = (version: string) => makeEmbed({
    title: `Prefix command version ${version} was added successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, version: string, emoji: string, enabled: boolean, versionId: string) => makeEmbed({
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
    const enabled = interaction.options.getBoolean('is_enabled') || false;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const existingVersion = await PrefixCommandVersion.findOne({ name });

    if (!existingVersion) {
        const prefixCommandVersion = new PrefixCommandVersion({
            name,
            emoji,
            enabled,
        });
        try {
            await prefixCommandVersion.save();
            await interaction.followUp({ embeds: [successEmbed(name)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, emoji, enabled, prefixCommandVersion.id)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to add a prefix command category ${name}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(name)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [alreadyExistsEmbed(name)], ephemeral: true });
    }
}
