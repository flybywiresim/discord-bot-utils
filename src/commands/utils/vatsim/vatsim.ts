import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { makeEmbed, slashCommand, slashCommandStructure } from '../../../lib';
import { handleVatsimStats } from './functions/vatsimStats';
import { handleVatsimControllers } from './functions/vatsimControllers';
import { handleVatsimPilots } from './functions/vatsimPilots';
import { handleVatsimObservers } from './functions/vatsimObservers';
import { handleVatsimEvents } from './functions/vatsimEvents';

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
    // Fetch VATSIM data

    let vatsimData;
    try {
        vatsimData = await fetch('https://data.vatsim.net/v3/vatsim-data.json').then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        });
    } catch (error) {
        await interaction.reply({ embeds: [fetchErrorEmbed(error)], ephemeral: true });
        return;
    }

    // Grap the callsign from the interaction

    let callsign = interaction.options.getString('callsign');
    let callsignSearch;

    if (callsign) {
        callsign = callsign.toUpperCase();

        const regexCheck = /^["']?(?<callsignSearch>[\w-]+)?["']?\s*$/;
        const regexMatches = callsign.match(regexCheck);

        if (!regexMatches || !regexMatches.groups || !regexMatches.groups.callsignSearch) {
            // eslint-disable-next-line consistent-return
            return interaction.reply({ content: 'You need to provide a valid callsign or part of a callsign to search for', ephemeral: true });
        }

        callsignSearch = regexMatches.groups.callsignSearch;
    }

    // Handle the subcommands

    const subcommandName = interaction.options.getSubcommand();

    switch (subcommandName) {
    case 'stats':
        await handleVatsimStats(interaction, vatsimData, callsignSearch);
        break;
    case 'controllers':
        await handleVatsimControllers(interaction, vatsimData, callsignSearch);
        break;
    case 'pilots':
        await handleVatsimPilots(interaction, vatsimData, callsignSearch);
        break;
    case 'observers':
        await handleVatsimObservers(interaction, vatsimData, callsignSearch);
        break;
    case 'events':
        await handleVatsimEvents(interaction);
        break;

    default:
        await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    }
});
