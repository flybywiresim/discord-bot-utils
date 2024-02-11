import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import fetch from 'node-fetch';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed, makeLines, Logger } from '../../lib';

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

    try {
        const metarReport: any = await fetch(`https://avwx.rest/api/metar/${icao}`, {
            method: 'GET',
            headers: { Authorization: metarToken },
        })
            .then((res) => res.json());

        if (metarReport.error) {
            const invalidEmbed = makeEmbed({
                title: `Metar Error | ${icao.toUpperCase()}`,
                description: metarReport.error,
                color: Colors.Red,
            });
            return interaction.editReply({ embeds: [invalidEmbed] });
        }
        const metarEmbed = makeEmbed({
            title: `METAR Report | ${metarReport.station}`,
            description: makeLines([
                '**Raw Report**',
                metarReport.raw,
                '',
                '**Basic Report:**',
                `**Time Observed:** ${metarReport.time.dt}`,
                `**Station:** ${metarReport.station}`,
                `**Wind:** ${metarReport.wind_direction.repr}${metarReport.wind_direction.repr === 'VRB' ? '' : constantsConfig.units.DEGREES} at ${metarReport.wind_speed.repr} ${metarReport.units.wind_speed}`,
                `**Visibility:** ${metarReport.visibility.repr} ${Number.isNaN(+metarReport.visibility.repr) ? '' : metarReport.units.visibility}`,
                `**Temperature:** ${metarReport.temperature.repr} ${constantsConfig.units.CELSIUS}`,
                `**Dew Point:** ${metarReport.dewpoint.repr} ${constantsConfig.units.CELSIUS}`,
                `**Altimeter:** ${metarReport.altimeter.value.toString()} ${metarReport.units.altimeter}`,
                `**Flight Rules:** ${metarReport.flight_rules}`,
            ]),
            fields: [
                {
                    name: 'Unsure of how to read the raw report?',
                    value: 'Please refer to our guide [here.](https://docs.flybywiresim.com/pilots-corner/airliner-flying-guide/weather/)',
                    inline: false,
                },
            ],
            footer: { text: 'This METAR report may not accurately reflect the weather in the simulator. However, it will always be similar to the current conditions present in the sim.' },
        });

        return interaction.editReply({ embeds: [metarEmbed] });
    } catch (e) {
        Logger.error('metar:', e);
        const fetchErrorEmbed = makeEmbed({
            title: 'Metar Error | Fetch Error',
            description: 'There was an error fetching the METAR report. Please try again later.',
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [fetchErrorEmbed] });
    }
});
