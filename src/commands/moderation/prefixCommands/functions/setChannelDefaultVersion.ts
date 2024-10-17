import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandVersion, PrefixCommandChannelDefaultVersion, Logger, makeEmbed, loadSinglePrefixCommandChannelDefaultVersionToCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Set Default Channel Version - No Connection',
    description: 'Could not connect to the database. Unable to set the channel default version.',
    color: Colors.Red,
});

const noVersionEmbed = (channel: string) => makeEmbed({
    title: 'Prefix Commands - Show Default Channel Version - No Version',
    description: `Failed to show default channel version for channel ${channel} as the configured version does not exist.`,
    color: Colors.Red,
});

const failedEmbed = (channel: string) => makeEmbed({
    title: 'Prefix Commands - Set Default Channel Version - Failed',
    description: `Failed to set the channel default version for channel ${channel}.`,
    color: Colors.Red,
});

const successEmbed = (channel: string, version: string, emoji: string) => makeEmbed({
    title: `Prefix Command Channel Default version set for channel ${channel} to version ${version} ${emoji}.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, channel: string, version: string, emoji: string) => makeEmbed({
    title: 'Prefix channel default version set',
    fields: [
        {
            name: 'Channel',
            value: channel,
        },
        {
            name: 'Version',
            value: `${version} - ${emoji}`,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
    ],
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Set Default Channel Version - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleSetPrefixCommandChannelDefaultVersion(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();

    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const channel = interaction.options.getChannel('channel')!;
    const version = interaction.options.getString('version')!;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    let foundVersion;
    if (version !== 'GENERIC') {
        foundVersion = await PrefixCommandVersion.findOne({ name: version });
    }

    if (foundVersion || version === 'GENERIC') {
        const { id: channelId, name: channelName } = channel;
        let versionId = '';
        let emoji = '';
        if (version === 'GENERIC') {
            versionId = 'GENERIC';
            emoji = '';
        } else if (foundVersion) {
            versionId = foundVersion.id;
            emoji = foundVersion.emoji;
        }
        const foundChannelDefaultVersion = await PrefixCommandChannelDefaultVersion.findOne({ channelId });
        const channelDefaultVersion = foundChannelDefaultVersion || new PrefixCommandChannelDefaultVersion({ channelId, versionId });
        channelDefaultVersion.versionId = versionId;
        try {
            await channelDefaultVersion.save();
            await loadSinglePrefixCommandChannelDefaultVersionToCache(channelDefaultVersion);
            await interaction.followUp({ embeds: [successEmbed(channelName, version, emoji)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, channelName, version, emoji)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to set the default channel version for channel ${channelName} to version ${version}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(channelName)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [noVersionEmbed(version)], ephemeral: true });
    }
}
