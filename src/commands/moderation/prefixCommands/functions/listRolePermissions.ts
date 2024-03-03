import { APIEmbedField, ChatInputCommandInteraction, Colors } from 'discord.js';
import { getConn, Logger, makeEmbed, PrefixCommand } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - List Role Permissions - No Connection',
    description: 'Could not connect to the database. Unable to list the prefix command role permissions.',
    color: Colors.Red,
});

const failedEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - List Role Permissions - Failed',
    description: `Failed to list the prefix command role permissions for command ${command}.`,
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - List Role Permissions - No Command',
    description: `Failed to list prefix command role permissions for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const noResultsEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - List Role Permissions - Does not exist',
    description: `No prefix command role permissions found for command ${command}.`,
});

const successEmbed = (command: string, fields: APIEmbedField[]) => makeEmbed({
    title: `Prefix Commands - Role Permissions for command ${command}`,
    fields,
    color: Colors.Green,
});

export async function handleListPrefixCommandRolePermissions(interaction: ChatInputCommandInteraction<'cached'>) {
    const conn = getConn();
    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command')!;
    const foundCommands = await PrefixCommand.find({ name: command });
    if (!foundCommands || foundCommands.length === 0) {
        await interaction.reply({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }
    const [foundCommand] = foundCommands;
    const foundRolePermissions = foundCommand.rolePermissions;

    if (foundRolePermissions) {
        const embedFields: APIEmbedField[] = [];
        for (let i = 0; i < foundRolePermissions.length; i++) {
            const permission = foundRolePermissions[i];
            const { id, type, roleId } = permission;
            embedFields.push({
                name: `<@&${roleId}> - ${type}`,
                value: `${id}`,
            });
        }
        try {
            await interaction.reply({ embeds: [successEmbed(command, embedFields)], ephemeral: false });
        } catch (error) {
            Logger.error(`Failed to list prefix command role permissions for command ${command}: ${error}`);
            await interaction.reply({ embeds: [failedEmbed(command)], ephemeral: true });
        }
    } else {
        await interaction.reply({ embeds: [noResultsEmbed(command)], ephemeral: true });
    }
}
