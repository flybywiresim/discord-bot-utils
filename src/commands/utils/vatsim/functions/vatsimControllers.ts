import { ChatInputCommandInteraction, EmbedField } from 'discord.js';
import { makeEmbed } from '../../../../lib';

/* eslint-disable camelcase */

const listEmbed = (type: string, fields: EmbedField[], totalCount: number, shownCount: number, callsign: string) =>
  makeEmbed({
    title: `VATSIM Data - ${callsign} - ${totalCount} ${type} online`,
    description: `A list of ${shownCount} online ${type} matching ${callsign}.`,
    fields,
  });

const controllersListEmbedFields = (
  callsign: string,
  frequency: string,
  logon: string,
  rating: string,
  atis: string,
  atisCode: string,
): EmbedField[] => {
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
    {
      name: 'Rating',
      value: `${rating}`,
      inline: true,
    },
  ];
  if (atis !== null) {
    let atisTitle = 'Info';
    if (atisCode) {
      atisTitle = `ATIS - Code: ${atisCode}`;
    } else if (atisCode !== undefined) {
      atisTitle = 'ATIS';
    }
    fields.push({
      name: atisTitle,
      value: atis,
      inline: false,
    });
  }

  return fields;
};

const handleLocaleDateTimeString = (date: Date) =>
  date.toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

export async function handleVatsimControllers(
  interaction: ChatInputCommandInteraction<'cached'>,
  vatsimData: any,
  callsignSearch: any,
) {
  const vatsimAllControllers = vatsimData.controllers
    ? vatsimData.controllers.filter((controller: { facility: number }) => controller.facility > 0)
    : null;

  const vatsimControllerRatings = vatsimData.ratings ? vatsimData.ratings : null;
  const vatsimControllers = vatsimAllControllers
    ? vatsimAllControllers.filter((controller: { callsign: string | string[] }) =>
        controller.callsign.includes(callsignSearch),
      )
    : null;
  const vatsimAtis = vatsimData.atis
    ? vatsimData.atis.filter((atis: { callsign: string | string[] }) => atis.callsign.includes(callsignSearch))
    : null;

  const { keys }: ObjectConstructor = Object;

  const fields: EmbedField[] = [
    ...vatsimControllers.sort((a: { facility: number }, b: { facility: number }) => b.facility - a.facility),
    ...vatsimAtis,
  ]
    .map((vatsimController) => {
      const { callsign, frequency, logon_time, atis_code, text_atis, rating } = vatsimController;
      const logonTime = new Date(logon_time);
      const logonTimeString = handleLocaleDateTimeString(logonTime);
      const ratingDetail = vatsimControllerRatings.filter((ratingInfo: { id: any }) => ratingInfo.id === rating);
      const { short, long } = ratingDetail[0];
      const ratingText = `${short} - ${long}`;
      const atisText = text_atis ? text_atis.join('\n') : null;

      return controllersListEmbedFields(callsign, frequency, logonTimeString, ratingText, atisText, atis_code);
    })
    .slice(0, 5)
    .flat();

  const totalCount = keys(vatsimControllers).length + keys(vatsimAtis).length;
  const shownCount = totalCount < 5 ? totalCount : 5;

  return interaction.reply({
    embeds: [listEmbed('Controllers & ATIS', fields, totalCount, shownCount, callsignSearch)],
  });
}
