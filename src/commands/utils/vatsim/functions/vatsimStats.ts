/* eslint-disable */
// Safer to be done separately due to complexity.

import { ChatInputCommandInteraction } from 'discord.js';
import { makeEmbed } from '../../../../lib';

const statsEmbed = (pilots: string, controllers: string, atis: string, observers: string, callsign: any) =>
  makeEmbed({
    title: callsign ? `VATSIM Data | Statistics for callsign ${callsign}` : 'VATSIM Data | Statistics',
    description: callsign
      ? `An overview of the current active Pilots, Controllers, ATIS and Observers matching ${callsign}.`
      : 'An overview of the current active Pilots, Controllers, ATIS and Observers.',
    fields: [
      {
        name: 'Pilots',
        value: pilots,
        inline: true,
      },
      {
        name: 'Controllers',
        value: controllers,
        inline: true,
      },
      {
        name: 'ATIS',
        value: atis,
        inline: true,
      },
      {
        name: 'Observers',
        value: observers,
        inline: true,
      },
    ],
  });

export async function handleVatsimStats(
  interaction: ChatInputCommandInteraction<'cached'>,
  vatsimData: any,
  callsignSearch: any,
) {
  const vatsimAllControllers = vatsimData.controllers
    ? vatsimData.controllers.filter((controller: { facility: number }) => controller.facility > 0)
    : null;
  const vatsimAllObservers = vatsimData.controllers
    ? vatsimData.controllers.filter((controller: { facility: number }) => controller.facility <= 0)
    : null;

  if (!callsignSearch) {
    const vatsimPilotCount = vatsimData.pilots ? vatsimData.pilots.length : 0;
    const vatsimControllerCount = vatsimAllControllers ? vatsimAllControllers.length : 0;
    const vatsimAtisCount = vatsimData.atis ? vatsimData.atis.length : 0;
    const vatsimObserverCount = vatsimAllObservers ? vatsimAllObservers.length : 0;

    return interaction.reply({
      embeds: [statsEmbed(vatsimPilotCount, vatsimControllerCount, vatsimAtisCount, vatsimObserverCount, null)],
    });
  }
  const vatsimPilots = vatsimData.pilots
    ? vatsimData.pilots.filter((pilot: { callsign: string | string[] }) => pilot.callsign.includes(callsignSearch))
    : null;
  const vatsimControllers = vatsimAllControllers
    ? vatsimAllControllers.filter((controller: { callsign: string | string[] }) =>
        controller.callsign.includes(callsignSearch),
      )
    : null;
  const vatsimAtis = vatsimData.atis
    ? vatsimData.atis.filter((atis: { callsign: string | string[] }) => atis.callsign.includes(callsignSearch))
    : null;
  const vatsimObservers = vatsimAllObservers
    ? vatsimAllObservers.filter((observer: { callsign: string | string[] }) =>
        observer.callsign.includes(callsignSearch),
      )
    : null;

  const vatsimPilotCount = vatsimPilots ? vatsimPilots.length : 0;
  const vatsimControllerCount = vatsimControllers ? vatsimControllers.length : 0;
  const vatsimAtisCount = vatsimAtis ? vatsimAtis.length : 0;
  const vatsimObserverCount = vatsimObservers ? vatsimObservers.length : 0;

  return interaction.reply({
    embeds: [statsEmbed(vatsimPilotCount, vatsimControllerCount, vatsimAtisCount, vatsimObserverCount, callsignSearch)],
  });
}
