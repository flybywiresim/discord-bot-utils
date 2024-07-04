import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { Request } from 'node-fetch';
import { z, ZodError } from 'zod';
import { AVWXRunwaySchema, AVWXStation, AVWXStationSchema, fetchForeignAPI, Logger, makeEmbed, makeLines, slashCommand, slashCommandStructure } from '../../lib';

type Runway = z.infer<typeof AVWXRunwaySchema>;

const data = slashCommandStructure({
    name: 'station',
    description: 'Provides station information.',
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
    title: 'Station Error | Missing Query',
    description: 'You must provide an airport ICAO code.',
    color: Colors.Red,
});

const errorEmbed = (error: string) => makeEmbed({
    title: 'Station Error',
    description: error,
    color: Colors.Red,
});

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply();

    const stationToken = process.env.STATION_TOKEN;

    if (!stationToken) {
        const noTokenEmbed = makeEmbed({
            title: 'Error | Station',
            description: 'Station token not found.',
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [noTokenEmbed] });
    }

    const icao = interaction.options.getString('icao');

    if (!icao) return interaction.editReply({ embeds: [noQueryEmbed] });

    let station: AVWXStation;
    try {
        station = await fetchForeignAPI<AVWXStation>(new Request(`https://avwx.rest/api/station/${icao}`, {
            method: 'GET',
            headers: { Authorization: stationToken },
        }), AVWXStationSchema);
    } catch (e) {
        if (e instanceof ZodError) {
            return interaction.editReply({ embeds: [errorEmbed('The API returned unknown data.')] });
        }
        Logger.error(`Error while fetching station info from AVWX: ${e}`);
        return interaction.editReply({ embeds: [errorEmbed(`An error occurred while fetching the station information for ${icao.toUpperCase()}.`)] });
    }

    const runwayIdents = station.runways ? station.runways.map((runways: Runway) => `**${runways.ident1}/${runways.ident2}:** `
        + `${runways.length_ft} ft x ${runways.width_ft} ft / `
        + `${Math.round(runways.length_ft * 0.3048)} m x ${Math.round(runways.width_ft * 0.3048)} m`) : null;

    const stationEmbed = makeEmbed({
        title: `Station Info | ${station.icao}`,
        description: makeLines([
            '**Station Information:**',
            `**Name:** ${station.name}`,
            `**Country:** ${station.country}`,
            `**City:** ${station.city}`,
            `**Latitude:** ${station.latitude}°`,
            `**Longitude:** ${station.longitude}°`,
            `**Elevation:** ${station.elevation_m} m/${station.elevation_ft} ft`,
            '',
            '**Runways (Length x Width):**',
            `${runwayIdents ? runwayIdents.toString().replace(/,/g, '\n') : 'N/A'}`,
            '',
            `**Type:** ${station.type.replace(/_/g, ' ')}`,
            `**Website:** ${station.website ?? 'N/A'}`,
            `**Wiki:** ${station.wiki ?? 'N/A'}`,
        ]),
        footer: { text: 'Due to limitations of the API, not all links may be up to date at all times.' },
    });

    return interaction.editReply({ embeds: [stationEmbed] });
});
