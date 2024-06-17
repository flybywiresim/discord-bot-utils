import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import moment from 'moment';
import { slashCommand, makeEmbed, makeLines, slashCommandStructure } from '../../lib';

const data = slashCommandStructure({
    name: 'simbrief-data',
    description: 'Gets the simbrief data for the given flight number/pilotID.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'retrieve',
            description: 'Shows data for your last filed flight plan.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'pilot_id',
                    description: 'Please provide your pilot ID.',
                    type: ApplicationCommandOptionType.String,
                    max_length: 100,
                    required: true,
                },
            ],
        },
        {
            name: 'support-request',
            description: 'Shows information on how to provide SimBrief data.',
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
});

const FBW_AIRFRAME_ID = '337364_1631550522735';

const simbriefdatarequestEmbed = makeEmbed({
    title: 'FlyByWire Support | SimBrief Data Request',
    description: makeLines([
        'To evaluate your problem we kindly ask you to enter the following bot command into a new message.',
        '```/simbrief_data retrieve```',
        'Enter your `pilotId` with your simbrief pilotId or userName (as set in the EFB settings). The Bot will read your last generated flight plan and display some details about it including the route.',
        '',
        '**Privacy notice**: If you share your pilotId or username it is possible to read your pilot name from the API the bot uses. This pilot name is by default your real name, but you can change it in the flight edit screen or your user profile in SimBrief. No data is stored by FlyByWire when using the command.',
    ]),
});

const errorEmbed = (errorMessage: any) =>
    makeEmbed({
        title: 'SimBrief Error',
        description: makeLines(['SimBrief data could not be read.', errorMessage]),
        color: Colors.Red,
    });

const simbriefIdMismatchEmbed = (enteredId: any, flightplanId: any) =>
    makeEmbed({
        title: 'SimBrief Data',
        description: makeLines([
            `Entered pilotId ${enteredId} and returned pilotId ${flightplanId} don't match. The pilotId might be used as username by someone else.`,
        ]),
    });

const simbriefEmbed = (flightplan: any) =>
    makeEmbed({
        title: 'SimBrief Data',
        description: makeLines([
            `**Generated at**: ${moment(flightplan.params.time_generated * 1000).format('DD.MM.YYYY, HH:mm:ss')}`,
            `**AirFrame**: ${flightplan.aircraft.name} ${flightplan.aircraft.internal_id} ${flightplan.aircraft.internal_id === FBW_AIRFRAME_ID ? '(provided by FBW)' : ''}`,
            `**AIRAC Cycle**: ${flightplan.params.airac}`,
            `**Origin**: ${flightplan.origin.icao_code}`,
            `**Destination**: ${flightplan.destination.icao_code}`,
            `**Route**: ${flightplan.general.route}`,
        ]),
    });

export default slashCommand(data, async ({ interaction }) => {
    if (interaction.options.getSubcommand() === 'support-request') {
        return interaction.reply({ embeds: [simbriefdatarequestEmbed] });
    }

    if (interaction.options.getSubcommand() === 'retrieve') {
        const simbriefId = interaction.options.getString('pilot_id');
        if (!simbriefId) return interaction.reply({ content: 'Invalid pilot ID!', ephemeral: true });

        const flightplan = await fetch(
            `https://www.simbrief.com/api/xml.fetcher.php?json=1&userid=${simbriefId}&username=${simbriefId}`,
        ).then((res) => res.json());

        if (flightplan.fetch.status !== 'Success') {
            interaction.reply({ embeds: [errorEmbed(flightplan.fetch.status)], ephemeral: true });
            return Promise.resolve();
        }

        if (!simbriefId.match(/\D/) && simbriefId !== flightplan.params.user_id) {
            interaction.reply({ embeds: [simbriefIdMismatchEmbed(simbriefId, flightplan.params.user_id)] });
        }
        interaction.reply({ embeds: [simbriefEmbed(flightplan)] });

        return Promise.resolve();
    }
    return Promise.resolve();
});
