import { ApplicationCommandOptionType, ApplicationCommandType, Colors, TextChannel } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed, getConn } from '../../../lib';
import { handleAddFaq } from './functions/addFaq';
import { handleRemoveFaq } from './functions/removeFaq';
import { handleListFaq } from './functions/listFaq';
import { handlePrintAllFAQ } from './functions/faqPrintAll';

const data = slashCommandStructure({
    name: 'faq',
    description: 'Command to manage FAQ messages.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator
    dm_permission: false,
    options: [
        {
            name: 'add',
            description: 'Adds an FAQ.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'remove',
            description: 'Removes an FAQ.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'faq_id',
                    description: 'ID of FAQ to remove.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'list',
            description: 'Lists all FAQs.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'print-all',
            description: 'Prints all FAQs.',
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
});

const noConnEmbed = makeEmbed({
    title: 'FAQ - No Connection',
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

    const faqID = interaction.options.getString('faq_id')!;
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

    switch (subcommandName) {
        case 'add':
            await handleAddFaq(interaction, modLogsChannel);
            break;
        case 'remove':
            await handleRemoveFaq(interaction, faqID, modLogsChannel);
            break;
        case 'list':
            await handleListFaq(interaction);
            break;
        case 'print-all':
            await handlePrintAllFAQ(interaction);
            break;

        default:
            await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    }
});
