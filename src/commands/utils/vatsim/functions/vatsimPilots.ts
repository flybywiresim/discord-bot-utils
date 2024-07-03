import { ChatInputCommandInteraction, EmbedField } from 'discord.js';
import { z } from 'zod';
import { VatsimFlightPlanSchema, VatsimPilotRatingSchema, VatsimData, makeEmbed } from '../../../../lib';

type PilotRating = z.infer<typeof VatsimPilotRatingSchema>;
type FlightPlan = z.infer<typeof VatsimFlightPlanSchema>;

/* eslint-disable camelcase */

const listEmbed = (type: string, fields: EmbedField[], totalCount: number, shownCount: number, callsign: string) => makeEmbed({
    title: `VATSIM Data - ${callsign} - ${totalCount} ${type} online`,
    description: `A list of ${shownCount} online ${type} matching ${callsign}.`,
    fields,
});
const pilotsListEmbedFields = (callsign: string, rating?: PilotRating, flightPlan?: FlightPlan) => {
    const fields = [
        {
            name: 'Callsign',
            value: callsign,
            inline: false,
        },
    ];

    if (rating) {
        fields.push({
            name: 'Rating',
            value: `${rating.short_name} - ${rating.long_name}`,
            inline: true,
        });
    }

    if (flightPlan) {
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

export async function handleVatsimPilots(interaction: ChatInputCommandInteraction<'cached'>, vatsimData: VatsimData, callsignSearch: string) {
    const pilots = vatsimData.pilots.filter((pilot) => pilot.callsign.includes(callsignSearch));
    pilots.sort((a, b) => b.pilot_rating - a.pilot_rating);

    const fields = pilots.map((pilot) => {
        const { callsign, flight_plan } = pilot;
        const rating = vatsimData.pilot_ratings.find((rating) => rating.id === pilot.pilot_rating);

        return pilotsListEmbedFields(callsign, rating, flight_plan ?? undefined);
    }).splice(0, 5);

    return interaction.editReply({ embeds: [listEmbed('Pilots', fields.flat(), pilots.length, fields.length, callsignSearch)] });
}
