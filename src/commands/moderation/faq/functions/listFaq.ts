import { ChatInputCommandInteraction } from 'discord.js';
import moment from 'moment/moment';
import { Logger, makeEmbed, FAQ, sendPaginatedEmbed } from '../../../../lib';

const faqListEmbed = (faqFields: { name: string; value: string; }[], currentPage: number, totalPages: number) => makeEmbed({
    title: `FAQ List (Page ${currentPage} of ${totalPages})`,
    fields: faqFields,
});

export async function handleListFaq(interaction: ChatInputCommandInteraction<'cached'>) {
    try {
        const faqs = await FAQ.find({});

        if (!faqs.length) {
            await interaction.reply({ content: 'No FAQs exist.', ephemeral: true });
            return;
        }

        const pageLimit = 5;
        const embeds = [];
        let currentPage = 1;
        let faqsAddedToPage = 0;
        const faqFields: { name: string; value: string; }[] = [];

        for (const faq of faqs) {
            const formattedDate: string = moment(faq.dateSet)
                .utcOffset(0)
                .format();
            let moderatorUser;
            try {
                const moderator = await interaction.client.users.fetch(faq.moderatorID!);
                moderatorUser = moderator.toString();
            } catch (error) {
                moderatorUser = `I can't find the moderator, here is the stored ID ${faq.moderatorID}`;
            }

            faqFields.push(
                {
                    name: `**Title:** ${faq.faqTitle}`,
                    value:
                          `**Answer:** ${faq.faqAnswer}\n`
                        + `**Moderator:** ${moderatorUser}\n`
                        + `**Date Set:** ${formattedDate}\n`
                        + `**FAQ ID:** ${faq.id}\n`,
                },
                {
                    name: '',
                    value: '----------------------------------------',
                },
            );

            faqsAddedToPage++;
            if (faqsAddedToPage >= pageLimit) {
                embeds.push(faqListEmbed(faqFields, currentPage, Math.ceil(faqs.length / pageLimit)));
                faqsAddedToPage = 0;
                faqFields.length = 0;
                currentPage++;
            }
        }

        if (faqFields.length > 0) {
            embeds.push(faqListEmbed(faqFields, currentPage, Math.ceil(faqs.length / pageLimit)));
        }

        if (embeds.length === 0) {
            await interaction.reply({ content: 'No FAQs exist.', ephemeral: true });
            return;
        }

        await sendPaginatedEmbed(interaction, embeds);
    } catch (error) {
        Logger.error(error);
        await interaction.reply({ content: 'Could not list FAQs, error has been logged, please notify the bot team.', ephemeral: true });
    }
}
