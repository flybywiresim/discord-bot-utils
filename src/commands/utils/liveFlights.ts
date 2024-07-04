import { ApplicationCommandType, Colors } from 'discord.js';
import { Request } from 'node-fetch';
import { ZodError } from 'zod';
import { slashCommand, slashCommandStructure, makeEmbed, Logger, fetchForeignAPI, TelexCountSchema } from '../../lib';

const data = slashCommandStructure({
    name: 'live-flights',
    description: 'Get the current live flights for FlyByWire Simulations.',
    type: ApplicationCommandType.ChatInput,
});

const FBW_WEB_MAP_URL = 'https://flybywiresim.com/map';
const FBW_API_BASE_URL = 'https://api.flybywiresim.com';

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply();

    try {
        const flights = await fetchForeignAPI(new Request(`${FBW_API_BASE_URL}/txcxn/_count`), TelexCountSchema);
        const flightsEmbed = makeEmbed({
            title: 'Live Flights',
            description: `There are currently **${flights}** active flights with TELEX enabled.`,
            footer: { text: 'Note: This includes the A32NX, and other aircraft using FlyByWire systems' },
            url: FBW_WEB_MAP_URL,
            timestamp: new Date().toISOString(),
        });
        return interaction.editReply({ embeds: [flightsEmbed] });
    } catch (e) {
        if (e instanceof ZodError) {
            const errorEmbed = makeEmbed({
                title: 'TELEX Error',
                description: 'The API returned unknown data.',
                color: Colors.Red,
            });
            return interaction.editReply({ embeds: [errorEmbed] });
        }
        const error = e as Error;
        Logger.error(error);
        const errorEmbed = makeEmbed({
            title: 'Error | Live Flights',
            description: error.message,
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [errorEmbed] });
    }
});
