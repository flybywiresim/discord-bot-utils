import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { Request } from 'node-fetch';
import { ZodError } from 'zod';
import { constantsConfig, fetchData, makeEmbed, makeLines, slashCommand, slashCommandStructure, Metar, MetarSchema } from '../../lib';

const data = slashCommandStructure({
    name: 'metar',
    description: 'Provides the METAR report of the requested airport',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'icao',
        description: 'Provide an airport ICAO code.',
        type: ApplicationCommandOptionType.String,
        max_length: 4,
        min_length: 4,
        required: true,
    }],
});

const errorEmbed = (error: string) => makeEmbed({
    title: 'METAR Error',
    description: error,
    color: Colors.Red,
});

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply();

    const icao = interaction.options.getString('icao')!;

    const metarToken = process.env.METAR_TOKEN;

    if (!metarToken) {
        const noTokenEmbed = makeEmbed({
            title: 'Error | METAR',
            description: 'Metar token not found.',
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [noTokenEmbed] });
    }

    let metar: Metar;
    try {
        metar = await fetchData<Metar>(new Request(`https://avwx.rest/api/metar/${icao}`, {
            method: 'GET',
            headers: { Authorization: metarToken },
        }), MetarSchema);
    } catch (e) {
        if (e instanceof ZodError) {
            return interaction.editReply({ embeds: [errorEmbed('The API returned unknown data.')] });
        }
        return interaction.editReply({ embeds: [errorEmbed(`An error occurred while fetching the latest METAR for ${icao.toUpperCase()}.`)] });
    }

    const metarEmbed = makeEmbed({
        title: `METAR Report | ${metar.station}`,
        description: makeLines([
            '**Raw Report**',
            metar.raw,
            '',
            '**Basic Report:**',
            `**Time Observed:** ${metar.time.dt}`,
            `**Station:** ${metar.station}`,
            `**Wind:** ${metar.wind_direction.repr}${metar.wind_direction.repr === 'VRB' ? '' : constantsConfig.units.DEGREES} at ${metar.wind_speed.repr} ${metar.units.wind_speed}`,
            `**Visibility:** ${metar.visibility.repr} ${Number.isNaN(+metar.visibility.repr) ? '' : metar.units.visibility}`,
            `**Temperature:** ${metar.temperature.repr} ${constantsConfig.units.CELSIUS}`,
            `**Dew Point:** ${metar.dewpoint.repr} ${constantsConfig.units.CELSIUS}`,
            `**Altimeter:** ${metar.altimeter.value.toString()} ${metar.units.altimeter}`,
            `**Flight Rules:** ${metar.flight_rules}`,
        ]),
        fields: [
            {
                name: 'Unsure of how to read the raw report?',
                value: 'Please refer to our guide [here](https://docs.flybywiresim.com/pilots-corner/airliner-flying-guide/weather/).',
                inline: false,
            },
        ],
        footer: { text: 'This METAR report may not accurately reflect the weather in the simulator. However, it will always be similar to the current conditions present in the sim.' },
    });

    return interaction.editReply({ embeds: [metarEmbed] });
});
