import { ChatInputCommandInteraction, EmbedField } from 'discord.js';
import { z } from 'zod';
import { VatsimAtisSchema, VatsimRatingSchema, VatsimData, makeEmbed } from '../../../../lib';

type Atis = z.infer<typeof VatsimAtisSchema>;
type Rating = z.infer<typeof VatsimRatingSchema>;

/* eslint-disable camelcase */

const listEmbed = (type: string, fields: EmbedField[], totalCount: number, shownCount: number, callsign: string) => makeEmbed({
    title: `VATSIM Data - ${callsign} - ${totalCount} ${type} online`,
    description: `A list of ${shownCount} online ${type} matching ${callsign}.`,
    fields,
});

const controllersListEmbedFields = (callsign: string, frequency: string, logon: string, rating?: Rating, atis?: Atis): EmbedField[] => {
    const fields = [
        {
            name: 'Callsign',
            value: `${callsign}`,
            inline: false,
        },
        {
            name: 'Frequency',
            value: `${frequency}`,
            inline: true,
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

    if (atis && atis.text_atis) {
        fields.push({
            name: `ATIS - ${atis.atis_code ? atis.atis_code : 'N/A'}`,
            value: atis.text_atis.join('\n'),
            inline: false,
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

export async function handleVatsimControllers(interaction: ChatInputCommandInteraction<'cached'>, vatsimData: VatsimData, callsignSearch: string) {
    const controllers = vatsimData.controllers.filter((controller) => controller.facility > 0 && controller.callsign.includes(callsignSearch));
    controllers.sort((a, b) => b.facility - a.facility);

    const fields = controllers.map((controller) => {
        const { callsign, frequency, logon_time } = controller;
        const rating = vatsimData.ratings.find((rating) => rating.id === controller.rating);
        const atis = vatsimData.atis.find((atis) => atis.cid === controller.cid);

        return controllersListEmbedFields(callsign, frequency, handleLocaleDateTimeString(new Date(logon_time)), rating, atis);
    }).splice(0, 5);

    return interaction.editReply({ embeds: [listEmbed('Controllers & ATIS', fields.flat(), controllers.length, fields.length, callsignSearch)] });
}
