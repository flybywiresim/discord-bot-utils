import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure } from '../../../lib';
import { handleDeleteInfraction } from './functions/deleteInfractions';
import { handleListInfraction } from './functions/listInfractions';
import { handleUserNoteInfraction } from './functions/userNote';
import { handleWarnInfraction } from './functions/warn';
import { handleTimeoutInfraction } from './functions/timeout';
import { handleRemoveTimeoutInfraction } from './functions/removeTimeout';
import { handleBanInfraction } from './functions/ban';
import { handleUnbanInfraction } from './functions/unbanInfractions';

//Left to complete:
// Ban
// Unban

const data = slashCommandStructure({
    name: 'infractions',
    description: 'Command to manage infractions.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator roles
    dm_permission: false,
    options: [
        {
            name: 'list',
            description: 'Get infractions for a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'tag_or_id',
                    description: 'Please provide a user tag or ID.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        },
        {
            name: 'delete',
            description: 'Deletes the specified infraction.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'tag_or_id',
                    description: 'Please provide the user tag or ID for the user of the infraction you wish to delete.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'infraction_id',
                    description: 'Please provide the ID of the infraction you wish to delete.',
                    type: ApplicationCommandOptionType.String,
                    max_length: 100,
                    required: true,
                },
            ],
        },
        {
            name: 'note',
            description: 'Adds a logging note to a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'tag_or_id',
                    description: 'Please provide a user tag or ID.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'note',
                    description: 'Please provide a note.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'warn',
            description: 'Warns a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'tag_or_id',
                    description: 'Please provide a user tag or ID.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'Please provide a reason.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'timeout',
            description: 'Timeouts a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'tag_or_id',
                    description: 'Please provide a user tag or ID.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'duration',
                    description: 'Please provide a duration.',
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    choices: [
                        { name: '1 minute', value: 60000 },
                        { name: '5 minutes', value: 300000 },
                        { name: '15 minutes', value: 900000 },
                        { name: '30 minutes', value: 1800000 },
                        { name: '1 hour', value: 3600000 },
                        { name: '6 hours', value: 21600000 },
                        { name: '12 hours', value: 43200000 },
                        { name: '1 day', value: 86400000 },
                        { name: '3 days', value: 259200000 },
                        { name: '1 week', value: 604800000 },
                        { name: '2 weeks', value: 1209600000 },
                        { name: '3 weeks', value: 1814400000 },
                        { name: '4 weeks', value: 2419200000 },
                    ],
                },
                {
                    name: 'reason',
                    description: 'Please provide a reason.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'remove-timeout',
            description: 'Removes a timeout from a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'tag_or_id',
                    description: 'Please provide a user tag or ID.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        },
        {
            name: 'ban',
            description: 'Bans a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'tag_or_id',
                    description: 'Please provide a user tag or ID.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'Please provide a reason.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'days_deleted',
                    description: 'Please provide the number of days of messages to delete.',
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                    min_value: 0,
                    max_value: 7,
                },
            ],
        },
        {
            name: 'unban',
            description: 'Unbans a user.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'id',
                    description: 'Please provide a userID only.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'Please provide a reason.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
    ],
});

export default slashCommand(data, async ({ interaction }) => {
    const subcommandName = interaction.options.getSubcommand();

    switch (subcommandName) {
        case 'list':
            const userID = interaction.options.getUser('tag_or_id')?.id;
            await handleListInfraction(interaction, userID, false);
            break;
        case 'delete':
            await handleDeleteInfraction(interaction);
            break;
        case 'note':
            await handleUserNoteInfraction(interaction);
            break;
        case 'warn':
            await handleWarnInfraction(interaction);
            break;
        case 'timeout':
            await handleTimeoutInfraction(interaction);
            break;
        case 'remove-timeout':
            await handleRemoveTimeoutInfraction(interaction);
            break;
        case 'ban':
            await handleBanInfraction(interaction);
            break;
        case 'unban':
            await handleUnbanInfraction(interaction);
            break;

        default:
            await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    }
});
