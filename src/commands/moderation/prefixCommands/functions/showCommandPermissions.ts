import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { getConn, PrefixCommand, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Show Command Permissions - No Connection',
    description: 'Could not connect to the database. Unable to show the prefix command permissions.',
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Show Command Permissions - No Command',
    description: `Failed to show command permissions for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const failedEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Show Command Permissions - Failed',
    description: `Failed to show command permissions for command ${command}.`,
    color: Colors.Red,
});

const permissionEmbed = (command: string, roles: string[], rolesBlocklist: boolean, channels: string[], channelsBlocklist: boolean, quietErrors: boolean, verboseErrors: boolean) => makeEmbed({
    title: `Prefix Commands - Show Command Permissions - ${command}`,
    fields: [
        {
            name: 'Roles',
            value: roles.length > 0 ? roles.join(', ') : 'None',
        },
        {
            name: 'Roles Blocklist',
            value: rolesBlocklist ? 'Enabled' : 'Disabled',
        },
        {
            name: 'Channels',
            value: channels.length > 0 ? channels.join(', ') : 'None',
        },
        {
            name: 'Channels Blocklist',
            value: channelsBlocklist ? 'Enabled' : 'Disabled',
        },
        {
            name: 'Quiet Errors',
            value: quietErrors ? 'Enabled' : 'Disabled',
        },
        {
            name: 'Verbose Errors',
            value: verboseErrors ? 'Enabled' : 'Disabled',
        },
    ],
    color: Colors.Green,
});

export async function handleShowPrefixCommandPermissions(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command') || '';
    let foundCommands = await PrefixCommand.find({ name: command });
    if (!foundCommands || foundCommands.length > 1) {
        foundCommands = await PrefixCommand.find({ aliases: { $in: [command] } });
    }
    if (!foundCommands || foundCommands.length > 1) {
        await interaction.followUp({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }

    const [foundCommand] = foundCommands;
    const { permissions } = foundCommand;
    const { roles, rolesBlocklist, channels, channelsBlocklist, quietErrors, verboseErrors } = permissions;
    const roleNames = [];
    const channelNames = [];
    if (roles) {
        for (const role of roles) {
            // eslint-disable-next-line no-await-in-loop
            const discordRole = await interaction.guild.roles.fetch(role);
            if (discordRole) {
                const { name } = discordRole;
                roleNames.push(name);
            }
        }
    }
    if (channels) {
        for (const channel of channels) {
            // eslint-disable-next-line no-await-in-loop
            const discordChannel = await interaction.guild.channels.fetch(channel);
            if (discordChannel) {
                const { id: channelId } = discordChannel;
                channelNames.push(`<#${channelId}>`);
            }
        }
    }

    try {
        await interaction.followUp({ embeds: [permissionEmbed(command, roleNames, rolesBlocklist || false, channelNames, channelsBlocklist || false, quietErrors || false, verboseErrors || false)], ephemeral: false });
    } catch (error) {
        Logger.error(`Failed to show prefix command content for command ${command}: ${error}`);
        await interaction.followUp({ embeds: [failedEmbed(command)], ephemeral: true });
    }
}
