import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommand, Logger, makeEmbed, PrefixCommandChannelPermission, refreshSinglePrefixCommandCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Add Channel Permission - No Connection',
    description: 'Could not connect to the database. Unable to add the prefix command channel permission.',
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Add Channel Permission - No Command',
    description: `Failed to add the prefix command channel permission for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const failedEmbed = (command: string, channel: string, type: string) => makeEmbed({
    title: 'Prefix Commands - Add Channel Permission - Failed',
    description: `Failed to add the ${type} prefix command channel permission for command ${command} and channel <#${channel}>.`,
    color: Colors.Red,
});

const alreadyExistsEmbed = (command: string, channel: string) => makeEmbed({
    title: 'Prefix Commands - Add Channel Permission - Already exists',
    description: `A prefix command channel permission for command ${command} and channel <#${channel}> already exists. Not adding again.`,
    color: Colors.Red,
});

const successEmbed = (command: string, channel: string, type: string) => makeEmbed({
    title: `Prefix command channel ${type} permission added for command ${command} and channel <#${channel}>.}`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, channel: string, type: string) => makeEmbed({
    title: 'Add prefix command channel permission',
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
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Add Channel Permission - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleAddPrefixCommandChannelPermission(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command')!;
    const channel = interaction.options.getChannel('channel')!;
    const type = interaction.options.getString('type')!;
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

    const existingChannelPermission = foundCommand.channelPermissions.find((channelPermission) => channelPermission.channelId === channelId);
    if (!existingChannelPermission) {
        const newChannelPermission = new PrefixCommandChannelPermission({
            channelId,
            type,
        });
        try {
            foundCommand.channelPermissions.push(newChannelPermission);
            await foundCommand.save();
            await refreshSinglePrefixCommandCache(foundCommand, foundCommand);
            await interaction.followUp({ embeds: [successEmbed(command, channelId, type)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, command, channelId, type)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to add ${type} prefix command channel permission for command ${command} and channel <#${channel}>: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(command, channelId, type)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [alreadyExistsEmbed(command, channelId)], ephemeral: true });
    }
}
