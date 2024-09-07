import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandChannelDefaultVersion, Logger, makeEmbed, clearSinglePrefixCommandChannelDefaultVersionCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Unset Default Channel Version - No Connection',
    description: 'Could not connect to the database. Unable to unset the default channel version.',
    color: Colors.Red,
});

const failedEmbed = (channel: string) => makeEmbed({
    title: 'Prefix Commands - Unset Default Channel Version - Failed',
    description: `Failed to unset the default channel version with for ${channel}.`,
    color: Colors.Red,
});

const doesNotExistsEmbed = (channel: string) => makeEmbed({
    title: 'Prefix Commands - Unset Default Channel Version - Does not exist',
    description: `The default channel version with for ${channel} does not exists. Can not unset it.`,
    color: Colors.Red,
});

const successEmbed = (channel: string) => makeEmbed({
    title: `Default channel version for channel ${channel} was unset successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, channel: string) => makeEmbed({
    title: 'Prefix Commands - Default Channel Version unset',
    fields: [
        {
            name: 'Channel',
            value: channel,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
    ],
    color: Colors.Red,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Unset Default Channel Version - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleDeletePrefixCommandChannelDefaultVersion(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const channel = interaction.options.getChannel('channel')!;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const { id: channelId, name: channelName } = channel;
    const foundChannelDefaultVersions = await PrefixCommandChannelDefaultVersion.find({ channelId });

    if (foundChannelDefaultVersions && foundChannelDefaultVersions.length > 0) {
        try {
            await PrefixCommandChannelDefaultVersion.deleteOne({ channelId });
            await clearSinglePrefixCommandChannelDefaultVersionCache(channelId);
            await interaction.followUp({ embeds: [successEmbed(channelName)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, channelName)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to unset a default channel version for channel ${channelName}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(channelName)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistsEmbed(channelName)], ephemeral: true });
    }
}
