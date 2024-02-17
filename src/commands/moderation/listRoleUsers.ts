import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { constantsConfig, Logger, makeEmbed, sendPaginatedEmbed, slashCommand, slashCommandStructure } from '../../lib';

const data = slashCommandStructure({
    name: 'list-role-users',
    description: 'Lists all users with a specific role.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin, moderator and bot developer roles
    dm_permission: false,
    options: [
        {
            name: 'role',
            description: 'The role to list users for.',
            type: ApplicationCommandOptionType.Role,
            required: true,
        },
    ],
});

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply();

    const role = interaction.options.getRole('role');

    if (!role) return interaction.editReply({ content: 'Invalid role!' });

    const roleMembers = role.members.map((member) => ({
        tag: member.user.tag,
        id: member.id,
    }));

    const pageLimit = 50; // 50 per page as discord usernames have a max length of 32 characters. With the ID we don't exceed the 4096 character limit.
    const embeds = [];
    let currentPage = 0;
    let membersAddedToPage = 0;
    let description = '';
    const totalPages = Math.ceil(roleMembers.length / pageLimit);

    for (const member of roleMembers) {
        description += `${member.tag} - ID: ${member.id}\n`;
        membersAddedToPage++;

        if (membersAddedToPage >= pageLimit) {
            embeds.push(makeEmbed({
                title: `Role Users | ${role.name} - Page ${currentPage + 1} of ${totalPages}`,
                description,
            }));
            description = '';
            membersAddedToPage = 0;
            currentPage++;
        }
    }

    if (description.trim() !== '') {
        embeds.push(makeEmbed({
            title: `Role Users | ${role.name} - Page ${currentPage + 1} of ${totalPages}`,
            description,
        }));
    }

    if (embeds.length === 0) {
        return interaction.editReply({ content: 'No users with this role exist.' });
    }

    try {
        return sendPaginatedEmbed(interaction, embeds);
    } catch (error) {
        Logger.error('Error sending paginated embed', error);
        return interaction.editReply({ content: 'An error occurred while sending the paginated embed.' });
    }
});
