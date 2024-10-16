import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { AutocompleteCallback, constantsConfig, getConn, PrefixCommand, slashCommand, slashCommandStructure } from '../../../lib';
import { handleAddPrefixCommandChannelPermission } from './functions/addChannelPermission';
import { handleAddPrefixCommandRolePermission } from './functions/addRolePermission';
import { handleRemovePrefixCommandChannelPermission } from './functions/removeChannelPermission';
import { handleRemovePrefixCommandRolePermission } from './functions/removeRolePermission';
import { handleSetPrefixCommandPermissionSettings } from './functions/setCommandPermissionSettings';
import { handleShowPrefixCommandPermissions } from './functions/showCommandPermissions';

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
            name: 'show',
            description: 'Show the permissions of a prefix command.',
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
            name: 'settings',
            description: 'Manage prefix command permission settings.',
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
                    name: 'roles-blocklist',
                    description: 'Enable or disable the role blocklist.',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
                {
                    name: 'channels-blocklist',
                    description: 'Enable or disable the channel blocklist.',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
                {
                    name: 'quiet-errors',
                    description: 'Enable or disable quiet errors.',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
                {
                    name: 'verbose-errors',
                    description: 'Enable or disable verbose errors.',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
        {
            name: 'channels',
            description: 'Manage prefix command channel permissions.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
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
        const foundCommands = await PrefixCommand.find({ name: { $regex: searchText, $options: 'i' } })
            .sort({ name: 1 })
            .limit(25);
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

    switch (subcommandName) {
    case 'show':
        await handleShowPrefixCommandPermissions(interaction);
        return;
    case 'settings':
        await handleSetPrefixCommandPermissionSettings(interaction);
        return;
    default:
    }

    switch (subcommandGroup) {
    case 'channels':
        switch (subcommandName) {
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
