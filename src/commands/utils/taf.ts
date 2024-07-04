import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { Request } from 'node-fetch';
import { ZodError } from 'zod';
import { Logger, TAF, TafSchema, fetchForeignAPI, makeEmbed, makeLines, slashCommand, slashCommandStructure } from '../../lib';

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

const errorEmbed = (error: string) => makeEmbed({
    title: 'TAF Error',
    description: error,
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

    let taf: TAF;
    try {
        taf = await fetchForeignAPI<TAF>(new Request(`https://avwx.rest/api/taf/${icao}`, {
            method: 'GET',
            headers: { Authorization: tafToken },
        }), TafSchema);
    } catch (e) {
        if (e instanceof ZodError) {
            return interaction.editReply({ embeds: [errorEmbed('The API returned unknown data.')] });
        }
        Logger.error(`Error while fetching TAF from AVWX: ${e}`);
        return interaction.editReply({ embeds: [errorEmbed(`An error occurred while fetching the latest TAF for ${icao.toUpperCase()}.`)] });
    }

    const tafEmbed = makeEmbed({
        title: `TAF Report | ${taf.station}`,
        description: makeLines(['**Raw Report**', ...taf.forecast.map((forecast, i) => {
            if (i === 0) {
                return `${taf.station} ${forecast.raw}`;
            }
            return forecast.raw;
        })]),
        fields: [
            {
                name: 'Unsure of how to read the report?',
                value: `Please refer to our guide [here](https://docs.flybywiresim.com/pilots-corner/airliner-flying-guide/weather/#taf-example-decoded) or see above report decoded [here](https://e6bx.com/weather/${taf.station}/?showDecoded=1&focuspoint=tafdecoder).`,
                inline: false,
            },
        ],
        footer: { text: 'This TAF report is only a forecast, and may not accurately reflect weather in the simulator.' },
    });

    return interaction.editReply({ embeds: [tafEmbed] });
});
