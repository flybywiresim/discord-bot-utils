import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import fetch from 'node-fetch';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed, makeLines, Logger } from '../../lib';

const data = slashCommandStructure({
    name: 'taf',
    description: 'Provides the TAF report of the requested airport.',
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

const noQueryEmbed = makeEmbed({
    title: 'TAF Error | Missing Query',
    description: 'You must provide an airport ICAO code.',
    color: Colors.Red,
});

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply();

    const tafToken = process.env.TAF_TOKEN;

    if (!tafToken) {
        const noTokenEmbed = makeEmbed({
            title: 'Error | Station',
            description: 'Station token not found.',
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [noTokenEmbed] });
    }

    const icao = interaction.options.getString('icao');

    if (!icao) {
        return interaction.editReply({ embeds: [noQueryEmbed] });
    }

    try {
        const tafReport: any = await fetch(`https://avwx.rest/api/taf/${icao}`, {
            method: 'GET',
            headers: { Authorization: tafToken },
        }).then((res) => res.json());

        if (tafReport.error) {
            const invalidEmbed = makeEmbed({
                title: `TAF Error | ${icao.toUpperCase()}`,
                description: tafReport.error,
                color: Colors.Red,
            });
            return interaction.editReply({ embeds: [invalidEmbed] });
        }
        const getClouds = (clouds: any) => {
            const retClouds = [];
            for (const cloud of clouds) {
                retClouds.push(cloud.repr);
            }
            return retClouds.join(', ');
        };
        const tafEmbed = makeEmbed({
            title: `TAF Report | ${tafReport.station}`,
            description: makeLines([
                '**Raw Report**',
                tafReport.raw,

                '',
                '**Basic Report:**',
                `**Time Forecasted:** ${tafReport.time.dt}`,
                `**Forecast Start Time:** ${tafReport.start_time.dt}`,
                `**Forecast End Time:** ${tafReport.end_time.dt}`,
                `**Visibility:** ${tafReport.forecast[0].visibility.repr} ${Number.isNaN(+tafReport.forecast[0].visibility.repr) ? '' : tafReport.units.visibility}`,
                `**Wind:** ${tafReport.forecast[0].wind_direction.repr}${tafReport.forecast[0].wind_direction.repr === 'VRB' ? '' : constantsConfig.units.DEGREES} at ${tafReport.forecast[0].wind_speed.repr} ${tafReport.units.wind_speed}`,
                `**Clouds:** ${getClouds(tafReport.forecast[0].clouds)}`,
                `**Flight Rules:** ${tafReport.forecast[0].flight_rules}`,
            ]),
            fields: [
                {
                    name: 'Unsure of how to read the raw report?',
                    value: 'Please refer to our guide [here.](https://docs.flybywiresim.com/pilots-corner/airliner-flying-guide/weather/#taf-example-decoded)',
                    inline: false,
                },
            ],
            footer: { text: 'This TAF report is only a forecast, and may not accurately reflect weather in the simulator.' },
        });

        return interaction.editReply({ embeds: [tafEmbed] });
    } catch (error) {
        Logger.error('taf:', error);
        const fetchErrorEmbed = makeEmbed({
            title: 'TAF Error | Fetch Error',
            description: 'There was an error fetching the TAF report. Please try again later.',
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [fetchErrorEmbed] });
    }
});
