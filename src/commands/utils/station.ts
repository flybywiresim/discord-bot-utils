import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import fetch from 'node-fetch';
import { slashCommand, slashCommandStructure, makeEmbed, Logger, makeLines } from '../../lib';

const data = slashCommandStructure({
  name: 'station',
  description: 'Provides station information.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'icao',
      description: 'Provide an airport ICAO code.',
      type: ApplicationCommandOptionType.String,
      max_length: 4,
      min_length: 4,
      required: true,
    },
  ],
});

const noQueryEmbed = makeEmbed({
  title: 'Station Error | Missing Query',
  description: 'You must provide an airport ICAO code.',
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

  try {
    const stationReport: any = await fetch(`https://avwx.rest/api/station/${icao}`, {
      method: 'GET',
      headers: { Authorization: stationToken },
    }).then((res) => res.json());

    if (stationReport.error) {
      const invalidEmbed = makeEmbed({
        title: `Station Error | ${icao.toUpperCase()}`,
        description: stationReport.error,
        color: Colors.Red,
      });
      return interaction.editReply({ embeds: [invalidEmbed] });
    }

    const runwayIdents = stationReport.runways.map(
      (runways: any) =>
        `**${runways.ident1}/${runways.ident2}:** ` +
        `${runways.length_ft} ft x ${runways.width_ft} ft / ` +
        `${Math.round(runways.length_ft * 0.3048)} m x ${Math.round(runways.width_ft * 0.3048)} m`,
    );

    const stationEmbed = makeEmbed({
      title: `Station Info | ${stationReport.icao}`,
      description: makeLines([
        '**Station Information:**',
        `**Name:** ${stationReport.name}`,
        `**Country:** ${stationReport.country}`,
        `**City:** ${stationReport.city}`,
        `**Latitude:** ${stationReport.latitude}°`,
        `**Longitude:** ${stationReport.longitude}°`,
        `**Elevation:** ${stationReport.elevation_m} m/${stationReport.elevation_ft} ft`,
        '',
        '**Runways (Ident1/Ident2: Length x Width):**',
        `${runwayIdents.toString().replace(/,/g, '\n')}`,
        '',
        `**Type:** ${stationReport.type.replace(/_/g, ' ')}`,
        `**Website:** ${stationReport.website}`,
        `**Wiki:** ${stationReport.wiki}`,
      ]),
      footer: { text: 'Due to limitations of the API, not all links may be up to date at all times.' },
    });

    return interaction.editReply({ embeds: [stationEmbed] });
  } catch (error) {
    Logger.error('station:', error);
    const fetchErrorEmbed = makeEmbed({
      title: 'Station Error | Fetch Error',
      description: 'There was an error fetching the station report. Please try again later.',
      color: Colors.Red,
    });
    return interaction.editReply({ embeds: [fetchErrorEmbed] });
  }
});
