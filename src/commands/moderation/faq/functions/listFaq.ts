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

        const moderatorPromises = faqs.map((currentFaq) => interaction.client.users.fetch(currentFaq.moderatorID!)
            // eslint-disable-next-line arrow-body-style
            .catch(() => {
                return new Promise((resolve) => {
                    resolve(`I can't find the moderator, here is the stored ID: ${currentFaq.moderatorID}`);
                });
            } /* Return new promise that resolves the moderator id*/));
        const moderatorUsers = await Promise.all(moderatorPromises);

        for (let i = 0; i < faqs.length; i++) {
            const formattedDate = moment(faqs[i].dateSet).utcOffset(0).format();

            faqFields.push(
                {
                    name: `**Title:** ${faqs[i].faqTitle}`,
                    value:
                          `**Answer:** ${faqs[i].faqAnswer}\n`
                        + `**Moderator:** ${moderatorUsers[i]}\n`
                        + `**Date Set:** ${formattedDate}\n`
                        + `**FAQ ID:** ${faqs[i].id}\n`,
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
