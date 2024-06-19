import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  Interaction,
  InteractionResponse,
  Message,
} from 'discord.js';

export async function createPaginatedEmbedHandler(
  initialInteraction: CommandInteraction,
  embeds: EmbedBuilder[],
): Promise<void> {
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

  let message: Message | InteractionResponse;
  if (initialInteraction.deferred || initialInteraction.replied) {
    message = await initialInteraction.editReply({ embeds: [embeds[currentPage]], components: [buttonRow] });
  } else {
    message = await initialInteraction.reply({ embeds: [embeds[currentPage]], components: [buttonRow] });
  }

  const filter = (buttonInteraction: Interaction) => initialInteraction.user.id === buttonInteraction.user.id;
  const collector = message.createMessageComponentCollector({
    filter,
    componentType: ComponentType.Button,
    time: 120_000,
  });

  collector.on('collect', async (collectedInteraction: ButtonInteraction) => {
    await collectedInteraction.deferUpdate();

    if (collectedInteraction.customId === 'pagination_nextPage') {
      currentPage++;
    } else if (collectedInteraction.customId === 'pagination_prevPage') {
      currentPage--;
    }

    setButtonDisabledStates();

    await updateEmbed();
  });

  collector.on('end', async () => {
    await handleEmbedExpire();
  });

  async function updateEmbed() {
    await initialInteraction.editReply({ embeds: [embeds[currentPage]], components: [buttonRow] });
  }

  async function handleEmbedExpire() {
    const embed = embeds[currentPage];
    await initialInteraction.editReply({
      embeds: [
        embed.setFooter({
          text: `${embed.data.footer ? `${embed.data.footer.text} - ` : ''}This embed has expired.`,
        }),
      ],
      components: [],
    });
  }

  function setButtonDisabledStates() {
    prevButton.setDisabled(currentPage <= 0);
    nextButton.setDisabled(currentPage >= embeds.length - 1);
  }
}
