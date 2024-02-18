import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, Interaction, InteractionResponse, Message } from 'discord.js';

export async function sendPaginatedEmbed(interaction: CommandInteraction, embeds: any[]): Promise<void> {
    let currentPage = 0;

    const nextButton = new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary);

    const prevButton = new ButtonBuilder()
        .setCustomId('prev_page')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton);

    let message: Message<boolean> | InteractionResponse<boolean>;
    if ((interaction.deferred || interaction.deferred) || (interaction.deferred && interaction.deferred)) {
        message = await interaction.editReply({ embeds: [embeds[currentPage]], components: [buttonRow] });
    } else {
        message = await interaction.reply({ embeds: [embeds[currentPage]], components: [buttonRow] });
    }

    const filter = (buttonInteraction: Interaction) => buttonInteraction.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async (buttonInteraction: any) => {
        buttonInteraction.deferUpdate();

        if (buttonInteraction.customId === 'next_page') {
            currentPage++;
        } else if (buttonInteraction.customId === 'prev_page') {
            currentPage--;
        }

        if (currentPage < 0) {
            currentPage = 0;
        } else if (currentPage >= embeds.length) {
            currentPage = embeds.length - 1;
        }

        updateEmbed();
    });

    function updateEmbed() {
        message.edit({ embeds: [embeds[currentPage]], components: [buttonRow] });
    }
}
