import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommand, Logger, makeEmbed, refreshSinglePrefixCommandCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Remove Channel - No Connection',
    description: 'Could not connect to the database. Unable to remove the prefix command channel.',
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Remove Channel - No Command',
    description: `Failed to remove the prefix command channel for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const failedEmbed = (command: string, channel: string) => makeEmbed({
    title: 'Prefix Commands - Remove Channel- Failed',
    description: `Failed to remove the prefix command channel <#${channel}> for command ${command}.`,
    color: Colors.Red,
});

const doesNotExistEmbed = (command: string, channel: string) => makeEmbed({
    title: 'Prefix Commands - Remove Channel - Does not exist',
    description: `A prefix command channel <#${channel}> for command ${command} does not exist.`,
    color: Colors.Red,
});

const successEmbed = (command: string, channel: string) => makeEmbed({
    title: `Prefix command channel <#${channel}> removed for command ${command}.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, channel: string) => makeEmbed({
    title: 'Remove prefix command channel permission',
    fields: [
        {
            name: 'Command',
            value: command,
        },
        {
            name: 'Channel',
            value: `<#${channel}>`,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
    ],
    color: Colors.Red,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Remove Channel - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleRemovePrefixCommandChannelPermission(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command')!;
    const channel = interaction.options.getChannel('channel')!;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    let foundCommands = await PrefixCommand.find({ name: command });
    if (!foundCommands || foundCommands.length > 1) {
        foundCommands = await PrefixCommand.find({ aliases: { $in: [command] } });
    }
    if (!foundCommands || foundCommands.length > 1) {
        await interaction.followUp({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }
    const [foundCommand] = foundCommands;
    const { id: channelId } = channel;

    const existingChannelPermission = foundCommand.permissions.channels?.includes(channelId);
    if (existingChannelPermission) {
        foundCommand.permissions.channels = foundCommand.permissions.channels?.filter((id) => id !== channelId);
        try {
            await foundCommand.save();
            await refreshSinglePrefixCommandCache(foundCommand, foundCommand);
            await interaction.followUp({ embeds: [successEmbed(command, channelId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, command, channelId)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to remove prefix command channel <#${channel}> for command ${command}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(command, channelId)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistEmbed(command, channelId)], ephemeral: true });
    }
}
