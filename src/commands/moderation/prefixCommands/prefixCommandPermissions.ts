import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { AutocompleteCallback, constantsConfig, getConn, PrefixCommand, slashCommand, slashCommandStructure } from '../../../lib';
import { handleListPrefixCommandChannelPermissions } from './functions/listChannelPermissions';
import { handleListPrefixCommandRolePermissions } from './functions/listRolePermissions';
import { handleAddPrefixCommandChannelPermission } from './functions/addChannelPermission';
import { handleAddPrefixCommandRolePermission } from './functions/addRolePermission';
import { handleRemovePrefixCommandChannelPermission } from './functions/removeChannelPermission';
import { handleRemovePrefixCommandRolePermission } from './functions/removeRolePermission';

const colorChoices = [];
for (let i = 0; i < Object.keys(constantsConfig.colors).length; i++) {
    const name = Object.keys(constantsConfig.colors)[i];
    const value = constantsConfig.colors[name];
    colorChoices.push({ name, value });
}

const data = slashCommandStructure({
    name: 'prefix-command-permissions',
    description: 'Command to manage the permissions of prefix based commands.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator roles
    dm_permission: false,
    options: [
        {
            name: 'channels',
            description: 'Manage prefix command channel permissions.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'list',
                    description: 'Get list of prefix command channel permissions.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'command',
                            description: 'Provide the name of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true,
                            max_length: 32,
                        },
                    ],
                },
                {
                    name: 'add',
                    description: 'Add a channel permission for a prefix command.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'command',
                            description: 'Provide the name of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true,
                            max_length: 32,
                        },
                        {
                            name: 'channel',
                            description: 'Provide the channel to add or remove from the selected list.',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        },
                        {
                            name: 'type',
                            description: 'Select the type of the permission, permitted or prohibited',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                { name: 'Permitted', value: 'PERMITTED' },
                                { name: 'Prohibited', value: 'PROHIBITED' },
                            ],
                        },
                    ],
                },
                {
                    name: 'remove',
                    description: 'Remove a channel permission for a prefix command.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'command',
                            description: 'Provide the name of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true,
                            max_length: 32,
                        },
                        {
                            name: 'channel',
                            description: 'Provide the channel to add or remove from the selected list.',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            name: 'roles',
            description: 'Manage prefix command role permissions.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'list',
                    description: 'Get list of prefix command role permissions.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'command',
                            description: 'Provide the name of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true,
                            max_length: 32,
                        },
                    ],
                },
                {
                    name: 'add',
                    description: 'Add a role permission for a prefix command.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'command',
                            description: 'Provide the name of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true,
                            max_length: 32,
                        },
                        {
                            name: 'role',
                            description: 'Provide the role to add or remove from the selected list.',
                            type: ApplicationCommandOptionType.Role,
                            required: true,
                        },
                        {
                            name: 'type',
                            description: 'Select the type of the permission, permitted or prohibited',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                { name: 'Permitted', value: 'PERMITTED' },
                                { name: 'Prohibited', value: 'PROHIBITED' },
                            ],
                        },
                    ],
                },
                {
                    name: 'remove',
                    description: 'Remove a role permission for a prefix command.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'command',
                            description: 'Provide the name of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true,
                            max_length: 32,
                        },
                        {
                            name: 'role',
                            description: 'Provide the role to add or remove from the selected list.',
                            type: ApplicationCommandOptionType.Role,
                            required: true,
                        },
                    ],
                },
            ],
        },
    ],
});

const autocompleteCallback: AutocompleteCallback = async ({ interaction }) => {
    const autoCompleteOption = interaction.options.getFocused(true);
    const { name: optionName, value: searchText } = autoCompleteOption;
    let choices: ApplicationCommandOptionChoiceData<string>[] = [];

    const conn = getConn();

    switch (optionName) {
    case 'command':
        if (!conn) {
            return interaction.respond(choices);
        }
        const foundCommands = await PrefixCommand.find({ name: { $regex: searchText, $options: 'i' } });
        for (let i = 0; i < foundCommands.length; i++) {
            const command = foundCommands[i];
            const { name } = command;
            choices.push({ name, value: name });
        }
        break;
    default:
        choices = [];
    }

    return interaction.respond(choices);
};

export default slashCommand(data, async ({ interaction }) => {
    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subcommandName = interaction.options.getSubcommand();

    switch (subcommandGroup) {
    case 'channels':
        switch (subcommandName) {
        case 'list':
            await handleListPrefixCommandChannelPermissions(interaction);
            break;
        case 'add':
            await handleAddPrefixCommandChannelPermission(interaction);
            break;
        case 'remove':
            await handleRemovePrefixCommandChannelPermission(interaction);
            break;
        default:
            await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
        }
        break;
    case 'roles':
        switch (subcommandName) {
        case 'list':
            await handleListPrefixCommandRolePermissions(interaction);
            break;
        case 'add':
            await handleAddPrefixCommandRolePermission(interaction);
            break;
        case 'remove':
            await handleRemovePrefixCommandRolePermission(interaction);
            break;
        default:
            await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
        }
        break;
    default:
        await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    }
}, autocompleteCallback);
