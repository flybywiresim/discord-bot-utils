import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { getConn, PrefixCommandChannelDefaultVersion, PrefixCommandVersion, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Show Default Channel Version - No Connection',
    description: 'Could not connect to the database. Unable to show the channel default version.',
    color: Colors.Red,
});

const noVersionEmbed = (channel: string) => makeEmbed({
    title: 'Prefix Commands - Show Default Channel Version - No Version',
    description: `Failed to show default channel version for channel ${channel} as the configured version does not exist.`,
    color: Colors.Red,
});

const noChannelDefaultVersionEmbed = (channel: string) => makeEmbed({
    title: 'Prefix Commands - Show Default Channel Version - No Default Channel Version',
    description: `Failed to show the channel default version for channel ${channel} as there is no default version set.`,
    color: Colors.Red,
});

const failedEmbed = (channel: string) => makeEmbed({
    title: 'Prefix Commands - Show Default Channel Version - Failed',
    description: `Failed to show the channel default version for channel ${channel}.`,
    color: Colors.Red,
});

const contentEmbed = (channel: string, version: string, emoji: string, versionId: string) => makeEmbed({
    title: `Prefix Commands - Show Default Channel Version - ${channel} - ${version}`,
    fields: [
        {
            name: 'Channel',
            value: channel,
        },
        {
            name: 'Version',
            value: `${version} - ${emoji}`,
        },
    ],
    footer: { text: `Version ID: ${versionId}` },
    color: Colors.Green,
});

export async function handleShowPrefixCommandChannelDefaultVersion(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const channel = interaction.options.getChannel('channel')!;
    const { id: channelId, name: channelName } = channel;
    const foundChannelDefaultVersions = await PrefixCommandChannelDefaultVersion.find({ channelId });
    if (!foundChannelDefaultVersions || foundChannelDefaultVersions.length > 1) {
        await interaction.followUp({ embeds: [noChannelDefaultVersionEmbed(channelName)], ephemeral: true });
        return;
    }

    const [foundChannelDefaultVersion] = foundChannelDefaultVersions;
    const { versionId } = foundChannelDefaultVersion;
    const foundVersion = await PrefixCommandVersion.findById(versionId);
    if (!foundVersion) {
        await interaction.followUp({ embeds: [noVersionEmbed(channelName)], ephemeral: true });
        return;
    }

    const { name: version, emoji } = foundVersion;
    try {
        await interaction.followUp({ embeds: [contentEmbed(channelName, `${version}`, `${emoji}`, `${versionId}`)], ephemeral: false });
    } catch (error) {
        Logger.error(`Failed to show the channel default version for channel ${channel} and version ${version}: ${error}`);
        await interaction.followUp({ embeds: [failedEmbed(channelName)], ephemeral: true });
    }
}
