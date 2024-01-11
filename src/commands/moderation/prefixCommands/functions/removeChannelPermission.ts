import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandChannelPermission, PrefixCommand, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Remove Channel Permission - No Connection',
    description: 'Could not connect to the database. Unable to remove the prefix command channel permission.',
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Remove Channel Permission - No Command',
    description: `Failed to remove the prefix command channel permission for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const noChannelEmbed = (channel: string) => makeEmbed({
    title: 'Prefix Commands - Remove Channel Permission - No Channel',
    description: `Failed to remove the prefix command channel permission for channel <#${channel}> as the channel does not exist.`,
    color: Colors.Red,
});

const failedEmbed = (command: string, channel: string, type: string) => makeEmbed({
    title: 'Prefix Commands - Remove Channel Permission - Failed',
    description: `Failed to remove the ${type} prefix command channel permission for command ${command} and channel <#${channel}>.`,
    color: Colors.Red,
});

const doesNotExistEmbed = (command: string, channel: string) => makeEmbed({
    title: 'Prefix Commands - Remove Channel Permission - Does not exist',
    description: `A prefix command channel permission for command ${command} and channel <#${channel}> does not exist.`,
    color: Colors.Red,
});

const successEmbed = (command: string, channel: string, type: string, channelPermissionId: string) => makeEmbed({
    title: `Prefix command channel ${type} permission removed for command ${command} and channel <#${channel}>. ChannelPermission ID: ${channelPermissionId}`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, channel: string, type: string, commandId: string, channelPermissionId: string) => makeEmbed({
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
            name: 'Type',
            value: type,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
    ],
    footer: { text: `Command ID: ${commandId} - Channel Permission ID: ${channelPermissionId}` },
    color: Colors.Red,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Remove Channel Permission - No Mod Log',
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
    const channel = interaction.options.getString('channel')!;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    let foundCommand = await PrefixCommand.find({ name: command });
    if (!foundCommand || foundCommand.length > 1) {
        foundCommand = await PrefixCommand.find({ aliases: { $in: [command] } });
    }
    if (!foundCommand || foundCommand.length > 1) {
        await interaction.followUp({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }
    const { id: commandId } = foundCommand[0];

    const foundChannel = interaction.guild.channels.resolve(channel);
    if (!foundChannel) {
        await interaction.followUp({ embeds: [noChannelEmbed(channel)], ephemeral: true });
        return;
    }
    const { id: channelId } = foundChannel;

    const existingChannelPermission = await PrefixCommandChannelPermission.findOne({ commandId, channelId });
    if (existingChannelPermission) {
        const { id: channelPermissionId, type } = existingChannelPermission;
        try {
            await existingChannelPermission.deleteOne();
            await interaction.followUp({ embeds: [successEmbed(command, channel, type, channelPermissionId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, command, channel, type, commandId, channelPermissionId)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to remove ${type} prefix command channel permission for command ${command} and channel <#${channel}>: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(command, channel, type)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistEmbed(command, channel)], ephemeral: true });
    }
}
