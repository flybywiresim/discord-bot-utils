import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
    name: 'role_info',
    description: 'Lists the given role\'s amount of members.',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'role',
        description: 'Provide the role to get info about.',
        type: ApplicationCommandOptionType.Role,
        required: true,
    }],
});

export default slashCommand(data, async ({ interaction }) => {
    const role = interaction.options.getRole('role');

    if (!role) return interaction.reply({ content: 'Invalid role!', ephemeral: true });

    const roleMembers = role.members.map((member) => member.user.tag);
    const roleMemberCount = roleMembers.length;

    const roleInfoEmbed = makeEmbed({
        title: `Role Info | ${role.name}`,
        description: `Members: ${roleMemberCount}`,
    });

    return interaction.reply({ embeds: [roleInfoEmbed] });
});
