import { ChatInputCommandInteraction, EmbedField } from 'discord.js';
import { z } from 'zod';
import { VatsimRatingSchema, VatsimData, makeEmbed } from '../../../../lib';

type Rating = z.infer<typeof VatsimRatingSchema>;

/* eslint-disable camelcase */

const listEmbed = (type: string, fields: EmbedField[], totalCount: number, shownCount: number, callsign: string) => makeEmbed({
    title: `VATSIM Data - ${callsign} - ${totalCount} ${type} online`,
    description: `A list of ${shownCount} online ${type} matching ${callsign}.`,
    fields,
});

const observersListEmbedFields = (callsign: string, logon: string, rating?: Rating): EmbedField[] => {
    const fields = [
        {
            name: 'Callsign',
            value: `${callsign}`,
            inline: false,
        },
        {
            name: 'Logon Date & Time',
            value: `${logon}`,
            inline: true,
        },
    ];

    if (rating) {
        fields.push({
            name: 'Rating',
            value: `${rating.short} - ${rating.long}`,
            inline: true,
        });
    }

    return fields;
};

const handleLocaleDateTimeString = (date: Date) => date.toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
});

export async function handleVatsimObservers(interaction: ChatInputCommandInteraction<'cached'>, vatsimData: VatsimData, callsignSearch: string) {
    const observers = vatsimData.controllers.filter((controller) => controller.facility <= 0 && controller.callsign.includes(callsignSearch));

    const fields = observers.map((observer) => {
        const { callsign, logon_time } = observer;
        const rating = vatsimData.ratings.find((rating) => rating.id === observer.rating);

        return observersListEmbedFields(callsign, handleLocaleDateTimeString(new Date(logon_time)), rating);
    }).splice(0, 5);

    return interaction.editReply({ embeds: [listEmbed('Observers', fields.flat(), observers.length, fields.length, callsignSearch)] });
}
