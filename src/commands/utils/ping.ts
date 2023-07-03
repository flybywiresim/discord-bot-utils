import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
    name: 'ping',
    description: 'Ping the bot for a response.',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'message',
        description: 'Provide some text to send back.',
        type: ApplicationCommandOptionType.String,
        max_length: 100,
        required: false,
    }],
});

export default slashCommand(data, async ({ interaction }) => {
    const msg = interaction.options.getString('message') ?? 'Pong 🏓';

    const pongEmbed = makeEmbed({ description: msg });

    return interaction.reply({ embeds: [pongEmbed] });
});
