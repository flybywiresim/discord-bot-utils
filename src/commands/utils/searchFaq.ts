import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed, FAQ, Logger } from '../../lib';

const data = slashCommandStructure({
    name: 'faq_search',
    description: 'Searches the FAQs.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'search_term',
            description: 'The faq title to search for.',
            type: ApplicationCommandOptionType.String,
            max_length: 100,
            required: true,
        },
    ],
});

const noFaqsFoundEmbed = (searchTerm: string) => makeEmbed({
    title: `No FAQs found - ${searchTerm}`,
    description: 'No FAQs found matching your search term. Please try again or see the links below.',
    fields: [
        {
            name: '**FAQ Channel**',
            value: `<#${constantsConfig.channels.FAQ}>`,
        },
        {
            name: '**Docs FAQ**',
            value: 'https://docs.flybywiresim.com/fbw-a32nx/faq/',
        },
    ],
});

export default slashCommand(data, async ({ interaction }) => {
    const searchTerm = interaction.options.getString('search_term') ?? '';

    await interaction.deferReply();

    try {
        // Fetch FAQs from the database based on the search term
        const faq = await FAQ.findOne({ faqTitle: { $regex: new RegExp(searchTerm, 'i') } });

        if (!faq) {
            await interaction.followUp({ embeds: [noFaqsFoundEmbed(searchTerm)] });
        } else {
            const faqEmbed = makeEmbed({
                title: 'Frequently Asked Question',
                description: `Search results for **${searchTerm}**`,
                fields: [
                    {
                        name: `**${faq.faqTitle}**`,
                        value: `${faq.faqAnswer}`,
                    },
                ],
            });

            await interaction.followUp({ embeds: [faqEmbed] });
        }
    } catch (error) {
        Logger.error('Error fetching FAQ:', error);
        await interaction.followUp({ content: 'An error occurred while fetching the FAQ.', ephemeral: true });
    }
});
