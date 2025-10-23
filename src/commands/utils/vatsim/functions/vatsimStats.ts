import { ChatInputCommandInteraction } from 'discord.js';
import { VatsimData, makeEmbed } from '../../../../lib';

const statsEmbed = (pilots: number, controllers: number, atis: number, observers: number, callsign?: string) => makeEmbed({
    title: callsign ? `VATSIM Data | Statistics for callsign ${callsign}` : 'VATSIM Data | Statistics',
    description: callsign ? `An overview of the current active Pilots, Controllers, ATIS and Observers matching ${callsign}.` : 'An overview of the current active Pilots, Controllers, ATIS and Observers.',
    fields: [
        {
            name: 'Pilots',
            value: pilots.toString(),
            inline: true,
        },
        {
            name: 'Controllers',
            value: controllers.toString(),
            inline: true,
        },
        {
            name: 'ATIS',
            value: atis.toString(),
            inline: true,
        },
        {
            name: 'Observers',
            value: observers.toString(),
            inline: true,
        },
    ],
});

export async function handleVatsimStats(interaction: ChatInputCommandInteraction<'cached'>, vatsimData: VatsimData, callsignSearch?: string) {
    const controllers = vatsimData.controllers.filter((controller) => controller.facility > 0);
    const observers = vatsimData.controllers.filter((controller) => controller.facility <= 0);
    const { atis } = vatsimData;
    const { pilots } = vatsimData;

    if (!callsignSearch) {
        return interaction.editReply({ embeds: [statsEmbed(pilots.length, controllers.length, atis.length, observers.length)] });
    }

    const matchedControllers = controllers.filter((controller) => controller.callsign.includes(callsignSearch));
    const matchedObservers = observers.filter((observer) => observer.callsign.includes(callsignSearch));
    const matchedPilots = pilots.filter((pilot) => pilot.callsign.includes(callsignSearch));
    const matchedAtis = atis.filter((atis) => atis.callsign.includes(callsignSearch));

    return interaction.editReply({ embeds: [statsEmbed(matchedPilots.length, matchedControllers.length, matchedAtis.length, matchedObservers.length, callsignSearch)] });
}
