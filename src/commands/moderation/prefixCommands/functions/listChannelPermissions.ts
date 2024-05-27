import { APIEmbedField, ChatInputCommandInteraction, Colors } from 'discord.js';
import { getConn, Logger, makeEmbed, PrefixCommand } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - List Channel Permissions - No Connection',
    description: 'Could not connect to the database. Unable to list the prefix command channel permissions.',
    color: Colors.Red,
});

const failedEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - List Channel Permissions - Failed',
    description: `Failed to list the prefix command channel permissions for command ${command}.`,
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - List Channel Permissions - No Command',
    description: `Failed to list prefix command channel permissions for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const noResultsEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - List Channel Permissions - Does not exist',
    description: `No prefix command channel permissions found for command ${command}.`,
});

const successEmbed = (command: string, fields: APIEmbedField[]) => makeEmbed({
    title: `Prefix Commands - Channel Permissions for command ${command}`,
    fields,
    color: Colors.Green,
});

export async function handleListPrefixCommandChannelPermissions(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command')!;
    const foundCommands = await PrefixCommand.find({ name: command });
    if (!foundCommands || foundCommands.length === 0) {
        await interaction.followUp({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }
    const [foundCommand] = foundCommands;
    const foundChannelPermissions = foundCommand.channelPermissions;

    if (foundChannelPermissions) {
        const embedFields: APIEmbedField[] = [];
        for (let i = 0; i < foundChannelPermissions.length; i++) {
            const permission = foundChannelPermissions[i];
            const { id, type, channelId } = permission;
            embedFields.push({
                name: `<#${channelId}> - ${type}`,
                value: `${id}`,
            });
        }
        try {
            await interaction.followUp({ embeds: [successEmbed(command, embedFields)], ephemeral: false });
        } catch (error) {
            Logger.error(`Failed to list prefix command channel permissions for command ${command}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(command)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [noResultsEmbed(command)], ephemeral: true });
    }
}
