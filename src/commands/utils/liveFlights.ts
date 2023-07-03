import { ApplicationCommandType, Colors } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed, Logger } from '../../lib';

const data = slashCommandStructure({
    name: 'live_flights',
    description: 'Get the current live flights for FlyByWire Simulations.',
    type: ApplicationCommandType.ChatInput,
});

const FBW_WEB_MAP_URL = 'https://flybywiresim.com/map';
const FBW_API_BASE_URL = 'https://api.flybywiresim.com';

export default slashCommand(data, async ({ interaction }) => {
    try {
        const flights = await fetch(`${FBW_API_BASE_URL}/txcxn/_count`).then((res) => res.json());
        const flightsEmbed = makeEmbed({
            title: 'Live Flights',
            description: `There are currently **${flights}** active flights with TELEX enabled.`,
            footer: { text: 'Note: This includes the A32NX, and other aircraft using FlyByWire systems' },
            url: FBW_WEB_MAP_URL,
            timestamp: new Date().toISOString(),
        });
        return interaction.reply({ embeds: [flightsEmbed] });
    } catch (e) {
        const error = e as Error;
        Logger.error(error);
        const errorEmbed = makeEmbed({
            title: 'Error | Live Flights',
            description: error.message,
            color: Colors.Red,
        });
        return interaction.reply({ embeds: [errorEmbed] });
    }
});
