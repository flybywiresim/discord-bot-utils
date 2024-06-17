import { ButtonInteraction, GuildMember } from 'discord.js';
import { constantsConfig, Logger } from '../../../lib';

export async function handleRoleAssignment(interaction: ButtonInteraction, roleID: string) {
    await interaction.deferReply({ ephemeral: true });

    try {
        // Find the role object based on the customId
        let role = null;
        for (const group of constantsConfig.roleAssignmentIds) {
            role = group.roles.find((r) => r.id === roleID);
            if (role) break; // Stop searching if the role is found in any group
        }

        if (!role) {
            Logger.error('Role Assignment: Role not found');
            interaction.editReply({ content: 'I couldn\'t find that role' });
            return;
        }

        if (!interaction.member) {
            Logger.error('Role Assignment: Interaction member is null');
            return;
        }

        const member = interaction.member as GuildMember;

        const hasRole = member.roles.cache.has(role.id);

        if (hasRole) {
            await member.roles.remove(role.id);
            await interaction.editReply(`The role <@&${role.id}> has been removed.`);
        } else {
            await member.roles.add(role.id);
            await interaction.editReply(`The role <@&${role.id}> has been added.`);
        }
    } catch (error) {
        Logger.error(error);
        await interaction.editReply({ content: 'Something went wrong, this role may no longer exist. Please try again. The error message has been logged.' });
    }
}
