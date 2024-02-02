import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { constantsConfig, getConn, makeEmbed, slashCommand, slashCommandStructure } from '../../../lib';
import { createPoll } from './functions/createPoll';
import { deletePoll } from './functions/deletePoll';
import { listPoll } from './functions/listPoll';

const data = slashCommandStructure({
    name: 'poll',
    description: 'Command to polls.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator roles
    dm_permission: false,
    options: [
        {
            name: 'create',
            description: 'Creates a poll.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'title',
                    description: 'Please provide a poll title.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'description',
                    description: 'Please provide a poll description.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'duration',
                    description: 'Please provide a duration, default: infinite.',
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    choices: [
                        { name: 'infinite', value: -1 },
                        { name: '5 minutes', value: 300000 },
                        { name: '15 minutes', value: 900000 },
                        { name: '30 minutes', value: 1800000 },
                        { name: '1 hour', value: 3600000 },
                        { name: '6 hours', value: 21600000 },
                        { name: '12 hours', value: 43200000 },
                        { name: '1 day', value: 86400000 },
                        { name: '3 days', value: 259200000 },
                        { name: '1 week', value: 604800000 },
                    ],
                },
                {
                    name: 'abstain_allowed',
                    description: 'Whether or not abstaining is allowed, default: false.',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
                {
                    name: 'notify',
                    description: 'Add notification and ping roles here.',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
        {
            name: 'delete',
            description: 'Deletes the specified poll.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'poll_id',
                    description: 'Please provide the ID of the poll you wish to delete.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'list',
            description: 'Lists all polls.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'set-options',
            description: 'Sets the options for the specified poll.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'poll_id',
                    description: 'Please provide the ID of the poll you wish to set options for.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'option_number',
                    description: 'Please provide the option number you wish to set.',
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
                {
                    name: 'option_text',
                    description: 'Please provide the option text you wish to set.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'remove-options',
            description: 'Removes the options for the specified poll.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'poll_id',
                    description: 'Please provide the ID of the poll you wish to remove options for.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'option_number',
                    description: 'Please provide the option number you wish to remove.',
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        },
        {
            name: 'preview',
            description: 'Previews the specified poll.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'poll_id',
                    description: 'Please provide the ID of the poll you wish to preview.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'open',
            description: 'Opens the specified poll.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'poll_id',
                    description: 'Please provide the ID of the poll you wish to open.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'close',
            description: 'Closes the specified poll.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'poll_id',
                    description: 'Please provide the ID of the poll you wish to close.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
    ],
});

const noConnEmbed = makeEmbed({
    title: 'Poll - No Connection',
    description: 'Could not connect to the database',
    color: Colors.Red,
});

export default slashCommand(data, async ({ interaction }) => {
    const conn = getConn();

    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const subcommandName = interaction.options.getSubcommand();

    switch (subcommandName) {
    case 'create':
        await createPoll(interaction);
        break;
    case 'delete':
        await deletePoll(interaction);
        break;
    case 'list':
        await listPoll(interaction);
        break;
    case 'set_options':
        await interaction.reply({ content: 'Not implemented yet', ephemeral: true });
        break;
    case 'remove_options':
        await interaction.reply({ content: 'Not implemented yet', ephemeral: true });
        break;
    case 'preview':
        await interaction.reply({ content: 'Not implemented yet', ephemeral: true });
        break;
    case 'open':
        await interaction.reply({ content: 'Not implemented yet', ephemeral: true });
        break;
    case 'close':
        await interaction.reply({ content: 'Not implemented yet', ephemeral: true });
        break;

    default:
        await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    }
});
