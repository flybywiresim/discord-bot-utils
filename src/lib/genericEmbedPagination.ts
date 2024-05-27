import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, Interaction, InteractionResponse, Message } from 'discord.js';

export async function createPaginatedEmbedHandler(initialInteraction: CommandInteraction, embeds: EmbedBuilder[]): Promise<void> {
    let currentPage = 0;

    const nextButton = new ButtonBuilder()
        .setCustomId('pagination_nextPage')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary);

    const prevButton = new ButtonBuilder()
        .setCustomId('pagination_prevPage')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary);

    setButtonDisabledStates();

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton);

    let message: Message<boolean> | InteractionResponse<boolean>;
    if (initialInteraction.deferred || initialInteraction.replied) {
        message = await initialInteraction.editReply({ embeds: [embeds[currentPage]], components: [buttonRow] });
    } else {
        message = await initialInteraction.reply({ embeds: [embeds[currentPage]], components: [buttonRow] });
    }

    const filter = (buttonInteraction: Interaction) => initialInteraction.user.id === buttonInteraction.user.id;
    const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 120_000 });

    collector.on('collect', async (collectedInteraction: ButtonInteraction) => {
        collectedInteraction.deferUpdate();

        if (buttonInteraction.customId === 'pagination_nextPage') {
            currentPage++;
        } else if (buttonInteraction.customId === 'pagination_prevPage') {
            currentPage--;
        }

        setButtonDisabledStates();

        updateEmbed();
    });

    collector.on('end', async () => {
        handleEmbedExpire();
    });

    function updateEmbed() {
        initialInteraction.editReply({ embeds: [embeds[currentPage]], components: [buttonRow] });
    }

    function handleEmbedExpire() {
        initialInteraction.editReply({ embeds: [embeds[currentPage].setFooter({ text: 'This embed has expired.' })], components: [] });
    }

    function setButtonDisabledStates() {
        prevButton.setDisabled(currentPage <= 0);
        nextButton.setDisabled(currentPage >= embeds.length - 1);
    }
}
