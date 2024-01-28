import { ChatInputCommandInteraction } from 'discord.js';
import { constantsConfig, imageBaseUrl, Logger, makeEmbed, FAQ } from '../../../../lib';

const FLIGHT_DECK_IMAGE_URL = `${imageBaseUrl}/moderation/faq.png`;

const linksEmbed = makeEmbed({
    title: 'Useful Links',
    fields: [
        {
            name: '**Docs FAQ**',
            value: 'https://docs.flybywiresim.com/fbw-a32nx/faq/',
        },
        {
            name: '**Beginners Guide**',
            value: 'https://docs.flybywiresim.com/pilots-corner/beginner-guide/overview/',
        },
        {
            name: '**Flight School**',
            value: `<#${constantsConfig.channels.FLIGHT_SCHOOL}>`,
        },
        {
            name: '**Support**',
            value: `<#${constantsConfig.channels.A32NX_SUPPORT}>`,
        },
    ],
});

export async function handlePrintAllFAQ(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    try {
        // Fetch all FAQs from the database
        const faqs = await FAQ.find();

        if (faqs.length === 0) {
            return interaction.followUp('No FAQs found.');
        } if (interaction.channel) {
            await interaction.channel.send({ files: [FLIGHT_DECK_IMAGE_URL] });

            // Divide the FAQs into sets of 5
            const faqSets = [];
            for (let i = 0; i < faqs.length; i += 5) {
                const faqSet = faqs.slice(i, i + 5);
                faqSets.push(faqSet);
            }

            // Send an embed for each set of FAQs
            for (let i = 0; i < faqSets.length; i++) {
                const faqSet = faqSets[i];
                const faqEmbed = makeEmbed({
                    title: `Frequently Asked Questions (${i + 1}/${faqSets.length})`,
                    fields: faqSet.map((faq) => ({
                        name: `**${faq.faqTitle}**`,
                        value: `${faq.faqAnswer}`,
                    })),
                });

                // eslint-disable-next-line no-await-in-loop
                await interaction.channel.send({ embeds: [faqEmbed] });
            }

            await interaction.channel.send({ embeds: [linksEmbed] });
        } else {
            return interaction.followUp({ content: 'FAQs can only be printed in a text channel.', ephemeral: true });
        }
    } catch (error) {
        Logger.error('Error fetching FAQs:', error);
        return interaction.followUp('An error occurred while fetching FAQs.');
    }

    return interaction.followUp({ content: 'FAQs printed successfully.', ephemeral: true });
}
