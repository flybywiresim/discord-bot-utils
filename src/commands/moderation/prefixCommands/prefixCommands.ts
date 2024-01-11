import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure } from '../../../lib';
import { handleAddPrefixCommandCategory } from './functions/addCategory';
import { handleModifyPrefixCommandCategory } from './functions/modifyCategory';
import { handleDeletePrefixCommandCategory } from './functions/deleteCategory';
import { handleListPrefixCommandCategories } from './functions/listCategories';
import { handleAddPrefixCommandVersion } from './functions/addVersion';
import { handleModifyPrefixCommandVersion } from './functions/modifyVersion';
import { handleDeletePrefixCommandVersion } from './functions/deleteVersion';
import { handleListPrefixCommandVersions } from './functions/listVersions';
import { handleAddPrefixCommand } from './functions/addCommand';
import { handleModifyPrefixCommand } from './functions/modifyCommand';
import { handleDeletePrefixCommand } from './functions/deleteCommand';
import { handleListPrefixCommands } from './functions/listCommands';
import { handleShowPrefixCommandContent } from './functions/showContent';
import { handleSetPrefixCommandContent } from './functions/setContent';
import { handleDeletePrefixCommandContent } from './functions/deleteContent';

const colorChoices = [];
for (let i = 0; i < Object.keys(constantsConfig.colors).length; i++) {
    const name = Object.keys(constantsConfig.colors)[i];
    const value = constantsConfig.colors[name];
    colorChoices.push({ name, value });
}

const data = slashCommandStructure({
    name: 'prefix-commands',
    description: 'Command to manage prefix based commands.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator roles
    dm_permission: false,
    options: [
        {
            name: 'categories',
            description: 'Manage prefix command categories.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'add',
                    description: 'Add a prefix command category.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Provide a name for the prefix command category.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 32,
                        },
                        {
                            name: 'emoji',
                            description: 'Provide an emoji to identify the prefix command category.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 128,
                        },
                    ],
                },
                {
                    name: 'modify',
                    description: 'Modify a prefix command category.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'id',
                            description: 'Provide the id of the prefix command category.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 24,
                        },
                        {
                            name: 'name',
                            description: 'Provide a name for the prefix command category.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 32,
                        },
                        {
                            name: 'emoji',
                            description: 'Provide an emoji to identify the prefix command category.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 128,
                        },
                    ],
                },
                {
                    name: 'delete',
                    description: 'Delete a prefix command category.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'id',
                            description: 'Provide the id of the prefix command category.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 24,
                        },
                    ],
                },
                {
                    name: 'list',
                    description: 'Get list of prefix command categories.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'search_text',
                            description: 'Provide an optional search term.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 32,
                        },
                    ],
                },
            ],
        },
        {
            name: 'versions',
            description: 'Manage prefix command versions.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'add',
                    description: 'Add a prefix command version.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Provide a name for the prefix command version.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 32,
                        },
                        {
                            name: 'emoji',
                            description: 'Provide an emoji to identify the prefix command version.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 128,
                        },
                        {
                            name: 'is_enabled',
                            description: 'Indicate wether this version is enabled.',
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'modify',
                    description: 'Modify a prefix command version.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'id',
                            description: 'Provide the id of the prefix command version.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 24,
                        },
                        {
                            name: 'name',
                            description: 'Provide a name for the prefix command version.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 32,
                        },
                        {
                            name: 'emoji',
                            description: 'Provide an emoji to identify the prefix command version.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 128,
                        },
                        {
                            name: 'is_enabled',
                            description: 'Indicate wether this version is enabled.',
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'delete',
                    description: 'Delete a prefix command version.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'id',
                            description: 'Provide the id of the prefix command version.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 24,
                        },
                        {
                            name: 'force',
                            description: 'Force delete the version even if it is used for command content.',
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'list',
                    description: 'Get list of prefix command versions.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'search_text',
                            description: 'Provide an optional search term.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 32,
                        },
                    ],
                },
            ],
        },
        {
            name: 'commands',
            description: 'Manage prefix commands.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'add',
                    description: 'Add a prefix command.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Provide a name for the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 32,
                        },
                        {
                            name: 'category',
                            description: 'Provide the category for the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 32,
                        },
                        {
                            name: 'aliases',
                            description: 'Provide a comma separated list of aliases for the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 255,
                        },
                        {
                            name: 'is_embed',
                            description: 'Indicate wether this prefix command should print as an embed or regular message.',
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                        {
                            name: 'embed_color',
                            description: 'If this command results in an embed, specify the color.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 16,
                            choices: colorChoices,
                        },
                    ],
                },
                {
                    name: 'modify',
                    description: 'Modify a prefix command.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'id',
                            description: 'Provide the id of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 24,
                        },
                        {
                            name: 'name',
                            description: 'Provide a name for the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 32,
                        },
                        {
                            name: 'category',
                            description: 'Provide the category for the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 32,
                        },
                        {
                            name: 'aliases',
                            description: 'Provide a comma separated list of aliases for the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 255,
                        },
                        {
                            name: 'is_embed',
                            description: 'Indicate wether this prefix command should print as an embed or regular message.',
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                        {
                            name: 'embed_color',
                            description: 'If this command results in an embed, specify the color.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 16,
                            choices: colorChoices,
                        },
                    ],
                },
                {
                    name: 'delete',
                    description: 'Delete a prefix command.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'id',
                            description: 'Provide the id of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 24,
                        },
                    ],
                },
                {
                    name: 'list',
                    description: 'Get list of prefix commands.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'search_text',
                            description: 'Provide an optional search term.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 32,
                        },
                    ],
                },
            ],
        },
        {
            name: 'content',
            description: 'Manage prefix command content.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'show',
                    description: 'Show the details of the content of a command.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'command',
                            description: 'Provide the name of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 32,
                        },
                        {
                            name: 'version',
                            description: 'Provide the name of the prefix command version. Use GENERIC for the generic content.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 32,
                        },
                    ],
                },
                {
                    name: 'set',
                    description: 'Set a prefix command\'s content for a specific version.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'command',
                            description: 'Provide the name of the prefix command.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 32,
                        },
                        {
                            name: 'version',
                            description: 'Provide the name of the prefix command version. Use GENERIC for the generic content.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 32,
                        },
                        {
                            name: 'title',
                            description: 'Provide a title for the prefix command version content.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 255,
                        },
                        {
                            name: 'content',
                            description: 'Provide the content for the prefix command version content.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                        },
                        {
                            name: 'image',
                            description: 'Provide a URL for an image for the prefix command version content. Leave empty to set no image.',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            max_length: 255,
                        },
                    ],
                },
                {
                    name: 'delete',
                    description: 'Delete a prefix command\'s content for a specific version.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'id',
                            description: 'Provide the ID of the prefix command content.',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            max_length: 24,
                        },
                    ],
                },
            ],
        },
    ],
});

export default slashCommand(data, async ({ interaction }) => {
    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subcommandName = interaction.options.getSubcommand();

    switch (subcommandGroup) {
    case 'categories':
        switch (subcommandName) {
        case 'add':
            await handleAddPrefixCommandCategory(interaction);
            break;
        case 'modify':
            await handleModifyPrefixCommandCategory(interaction);
            break;
        case 'delete':
            await handleDeletePrefixCommandCategory(interaction);
            break;
        case 'list':
            await handleListPrefixCommandCategories(interaction);
            break;
        default:
            await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
        }
        break;
    case 'versions':
        switch (subcommandName) {
        case 'add':
            await handleAddPrefixCommandVersion(interaction);
            break;
        case 'modify':
            await handleModifyPrefixCommandVersion(interaction);
            break;
        case 'delete':
            await handleDeletePrefixCommandVersion(interaction);
            break;
        case 'list':
            await handleListPrefixCommandVersions(interaction);
            break;
        default:
            await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
        }
        break;
    case 'commands':
        switch (subcommandName) {
        case 'add':
            await handleAddPrefixCommand(interaction);
            break;
        case 'modify':
            await handleModifyPrefixCommand(interaction);
            break;
        case 'delete':
            await handleDeletePrefixCommand(interaction);
            break;
        case 'list':
            await handleListPrefixCommands(interaction);
            break;
        default:
            await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
        }
        break;
    case 'content':
        switch (subcommandName) {
        case 'show':
            await handleShowPrefixCommandContent(interaction);
            break;
        case 'set':
            await handleSetPrefixCommandContent(interaction);
            break;
        case 'delete':
            await handleDeletePrefixCommandContent(interaction);
            break;
        default:
            await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
        }
        break;
    default:
        await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    }
});
