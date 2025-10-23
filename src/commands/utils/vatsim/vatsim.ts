import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { ZodError } from 'zod';
import { Logger, VatsimData, VatsimDataSchema, fetchForeignAPI, makeEmbed, slashCommand, slashCommandStructure } from '../../../lib';
import { handleVatsimControllers } from './functions/vatsimControllers';
import { handleVatsimEvents } from './functions/vatsimEvents';
import { handleVatsimObservers } from './functions/vatsimObservers';
import { handleVatsimPilots } from './functions/vatsimPilots';
import { handleVatsimStats } from './functions/vatsimStats';

const data = slashCommandStructure({
    name: 'vatsim',
    description: 'Displays information about Vatsim.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'data',
            description: 'Vatsim data.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'stats',
                    description: 'Displays Vatsim stats.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'callsign',
                            description: 'Please provide a callsign to retrieve specific data.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'controllers',
                    description: 'Displays Vatsim controllers and ATIS.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'callsign',
                            description: 'Please provide a callsign.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'pilots',
                    description: 'Displays Vatsim pilots.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'callsign',
                            description: 'Please provide a callsign.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'observers',
                    description: 'Displays Vatsim observers.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'callsign',
                            description: 'Please provide a callsign.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            name: 'events',
            description: 'Displays Vatsim events.',
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
});

const fetchErrorEmbed = (error: any) => makeEmbed({
    title: 'VATSIM Data - Fetching data failure',
    description: `Could not fetch the VATSIM data from the VATSIM API service: ${error}`,
    color: Colors.Red,
});

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply();

    // Fetch VATSIM data
    let vatsimData: VatsimData;
    try {
        vatsimData = await fetchForeignAPI('https://data.vatsim.net/v3/vatsim-data.json', VatsimDataSchema);
    } catch (e) {
        if (e instanceof ZodError) {
            return interaction.editReply({ embeds: [fetchErrorEmbed('The VATSIM API returned unknown data.')] });
        }
        Logger.error(`Error while fetching VATSIM data: ${String(e)}.`);
        return interaction.editReply({ embeds: [fetchErrorEmbed('An error occurred while fetching data from VATSIM.')] });
    }

    // Grap the callsign from the interaction
    let callsign = interaction.options.getString('callsign');
    let callsignSearch: string | undefined;

    if (callsign) {
        callsign = callsign.toUpperCase();

        const regexCheck = /^["']?(?<callsignSearch>[\w-]+)?["']?\s*$/;
        const regexMatches = callsign.match(regexCheck);

        if (!regexMatches || !regexMatches.groups || !regexMatches.groups.callsignSearch) {
            return interaction.editReply({ content: 'You need to provide a valid callsign or part of a callsign to search for.' });
        }

        callsignSearch = regexMatches.groups.callsignSearch;
    }

    // Handle the subcommands
    const subcommandName = interaction.options.getSubcommand();

    switch (subcommandName) {
    case 'stats': {
        return handleVatsimStats(interaction, vatsimData, callsignSearch);
    }
    case 'controllers': {
        if (!callsignSearch) {
            return interaction.editReply({ content: 'You need to provide a valid callsign or part of a callsign to search for.' });
        }
        return handleVatsimControllers(interaction, vatsimData, callsignSearch);
    }
    case 'pilots': {
        if (!callsignSearch) {
            return interaction.editReply({ content: 'You need to provide a valid callsign or part of a callsign to search for.' });
        }
        return handleVatsimPilots(interaction, vatsimData, callsignSearch);
    }
    case 'observers': {
        if (!callsignSearch) {
            return interaction.editReply({ content: 'You need to provide a valid callsign or part of a callsign to search for.' });
        }
        return handleVatsimObservers(interaction, vatsimData, callsignSearch);
    }
    case 'events': {
        return handleVatsimEvents(interaction);
    }
    default: {
        return interaction.editReply({ content: 'Unknown subcommand' });
    }
    }
});
