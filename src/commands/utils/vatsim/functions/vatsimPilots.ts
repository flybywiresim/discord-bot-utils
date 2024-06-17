import { ChatInputCommandInteraction, EmbedField } from 'discord.js';
import { makeEmbed } from '../../../../lib';

const listEmbed = (type: string, fields: EmbedField[], totalCount: number, shownCount: number, callsign: string) =>
  makeEmbed({
    title: `VATSIM Data - ${callsign} - ${totalCount} ${type} online`,
    description: `A list of ${shownCount} online ${type} matching ${callsign}.`,
    fields,
  });
const pilotsListEmbedFields = (callsign: string, rating: string, flightPlan: any) => {
  const fields = [
    {
      name: 'Callsign',
      value: callsign,
      inline: false,
    },
    {
      name: 'Rating',
      value: rating,
      inline: true,
    },
  ];

  if (flightPlan !== null) {
    const { aircraft_short, departure, arrival } = flightPlan;
    fields.push(
      {
        name: 'Route',
        value: `${departure} - ${arrival}`,
        inline: true,
      },
      {
        name: 'Aircraft',
        value: `${aircraft_short}`,
        inline: true,
      },
    );
  }

  return fields;
};

export async function handleVatsimPilots(
  interaction: ChatInputCommandInteraction<'cached'>,
  vatsimData: any,
  callsignSearch: any,
) {
  const vatsimPilotRatings = vatsimData.pilot_ratings ? vatsimData.pilot_ratings : null;
  const vatsimPilots = vatsimData.pilots
    ? vatsimData.pilots.filter((pilot: { callsign: (string | null)[] }) => pilot.callsign.includes(callsignSearch))
    : null;

  const { keys }: ObjectConstructor = Object;

  const fields: EmbedField[] = [
    ...vatsimPilots.sort((a: { pilot_rating: number }, b: { pilot_rating: number }) => b.pilot_rating - a.pilot_rating),
  ]
    .map((vatsimPilot) => {
      const { callsign, pilot_rating, flight_plan } = vatsimPilot;
      const ratingDetail = vatsimPilotRatings.filter((ratingInfo: { id: number }) => ratingInfo.id === pilot_rating);
      const { short_name, long_name } = ratingDetail[0];
      const ratingText = `${short_name} - ${long_name}`;

      return pilotsListEmbedFields(callsign, ratingText, flight_plan);
    })
    .slice(0, 5)
    .flat();

  const totalCount = keys(vatsimPilots).length;
  const shownCount = totalCount < 5 ? totalCount : 5;

  return interaction.reply({ embeds: [listEmbed('Pilots', fields, totalCount, shownCount, callsignSearch)] });
}
