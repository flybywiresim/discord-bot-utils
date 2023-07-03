import { GuildMember } from 'discord.js';
import { constantsConfig, event, Events, Logger } from '../lib';

export default event(Events.InteractionCreate, async ({ log }, interaction) => {
    if (!interaction.isButton()) return;

    Logger.info('Role Assignment: Button pressed');

    try {
        const roleButtonCustomIds = constantsConfig.roleAssignmentIds.flatMap((group) => group.roles.map((role) => role.id));

        const { customId } = interaction;

        // Check if the pressed button's custom ID is in the array of role-related custom IDs
        if (!roleButtonCustomIds.includes(customId)) {
            Logger.info('Role Assignment: Custom ID not matched');
            // If the custom ID doesn't match any role-related buttons, return early
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        // Find the role object based on the customId
        let role = null;
        for (const group of constantsConfig.roleAssignmentIds) {
            role = group.roles.find((r) => r.id === customId);
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
        log(error);
        await interaction.editReply({ content: 'Something went wrong, this role may no longer exist. Please try again. The error message has been logged.' });
    }
});
