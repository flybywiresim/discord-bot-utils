import { ChatInputCommandInteraction, EmbedField } from 'discord.js';
import { makeEmbed } from '../../../../lib';

/* eslint-disable camelcase */

const listEmbed = (type: string, fields: EmbedField[], totalCount: number, shownCount: number, callsign: string) => makeEmbed({
    title: `VATSIM Data - ${callsign} - ${totalCount} ${type} online`,
    description: `A list of ${shownCount} online ${type} matching ${callsign}.`,
    fields,
});

const observersListEmbedFields = (callsign: string, logon: string, rating: string, atis: string): EmbedField[] => {
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
        {
            name: 'Rating',
            value: `${rating}`,
            inline: true,
        },
    ];
    if (atis !== null) {
        const atisTitle = 'Info';
        fields.push({
            name: atisTitle,
            value: atis,
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

export async function handleVatsimObservers(interaction: ChatInputCommandInteraction<'cached'>, vatsimData: any, callsignSearch: any) {
    const vatsimAllObservers = vatsimData.controllers ? vatsimData.controllers.filter((controller: { facility: number; }) => controller.facility <= 0) : null;

    const vatsimControllerRatings = vatsimData.ratings ? vatsimData.ratings : null;
    const vatsimObservers = vatsimAllObservers ? vatsimAllObservers.filter((observer: { callsign: string | any[]; }) => observer.callsign.includes(callsignSearch)) : null;

    const { keys }: ObjectConstructor = Object;

    const fields: EmbedField[] = [...vatsimObservers.sort((a: { rating: number; }, b: { rating: number; }) => b.rating - a.rating)].map((vatsimObserver) => {
        const { callsign, logon_time, text_atis, rating } = vatsimObserver;
        const logonTime = new Date(logon_time);
        const logonTimeString = handleLocaleDateTimeString(logonTime);
        const ratingDetail = vatsimControllerRatings.filter((ratingInfo: { id: any; }) => ratingInfo.id === rating);
        const { short, long } = ratingDetail[0];
        const ratingText = `${short} - ${long}`;
        const atisText = text_atis ? text_atis.join('\n') : null;

        return observersListEmbedFields(callsign, logonTimeString, ratingText, atisText);
    }).slice(0, 5).flat();

    const totalCount = keys(vatsimObservers).length;
    const shownCount = totalCount < 5 ? totalCount : 5;

    return interaction.reply({ embeds: [listEmbed('Observers', fields, totalCount, shownCount, callsignSearch)] });
}
