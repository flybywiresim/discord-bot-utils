import { ApplicationCommandType } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
    name: 'member-count',
    description: 'Lists the current member count for the server.',
    type: ApplicationCommandType.ChatInput,
});

export default slashCommand(data, async ({ interaction }) => {
    const memberCountEmbed = makeEmbed({
        title: 'Member Count',
        description: `There are currently **${interaction.guild?.memberCount}** members in the server.`,
    });

    return interaction.reply({ embeds: [memberCountEmbed] });
});
