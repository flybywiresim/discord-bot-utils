import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure } from '../../../lib';

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
                    name: 'options',
                    description: 'Please provide options, seperated by `|`.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'duration',
                    description: 'Please provide a duration, default: infinite.',
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                },
                {
                    name: 'max_votes',
                    description: 'How many times a user can vote, default: 1.',
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                },
                {
                    name: 'notify_roles',
                    description: 'Please provide roles to notify, default: none.',
                    type: ApplicationCommandOptionType.Role,
                    required: false,
                },
            ],
        },
    ],
});

export default slashCommand(data, async ({ interaction }) => {
    const title = interaction.options.getString('title', true);
    const optionsString = interaction.options.getString('options', true);
    const duration = interaction.options.getInteger('duration', false);
    const maxVotes = interaction.options.getInteger('max_votes', false);
    const notifyRoles = interaction.options.getRole('notify_roles', false);
});
