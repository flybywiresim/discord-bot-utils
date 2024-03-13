import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, CommandInteraction } from 'discord.js';

export async function sendPaginatedInfractionEmbeds(interaction: CommandInteraction, user:string, embeds: any[], infractionsLengths: { warnsLength: string; timeoutsLength: string; scamLogsLength: string; bansLength: string; unbansLength: string; notesLength: string; }): Promise<void> {
    let currentPage = 0;

    const aboutButton = new ButtonBuilder()
        .setCustomId('about')
        .setLabel('About')
        .setStyle(ButtonStyle.Success);

    const warnButton = new ButtonBuilder()
        .setCustomId('warns')
        .setLabel(`Warns (${infractionsLengths.warnsLength})`)
        .setStyle(ButtonStyle.Primary);

    const timeoutButton = new ButtonBuilder()
        .setCustomId('timeouts')
        .setLabel(`Timeouts (${infractionsLengths.timeoutsLength})`)
        .setStyle(ButtonStyle.Primary);

    const scamLogButton = new ButtonBuilder()
        .setCustomId('scamlog')
        .setLabel(`Scam Logs (${infractionsLengths.scamLogsLength})`)
        .setStyle(ButtonStyle.Primary);

    const banButton = new ButtonBuilder()
        .setCustomId('bans')
        .setLabel(`Bans (${infractionsLengths.bansLength})`)
        .setStyle(ButtonStyle.Primary);

    const unbanButton = new ButtonBuilder()
        .setCustomId('unbans')
        .setLabel(`Unbans (${infractionsLengths.unbansLength})`)
        .setStyle(ButtonStyle.Primary);

    const noteButton = new ButtonBuilder()
        .setCustomId('notes')
        .setLabel(`Notes (${infractionsLengths.notesLength})`)
        .setStyle(ButtonStyle.Primary);

    const buttonRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(aboutButton, warnButton, timeoutButton);
    const buttonRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(scamLogButton, banButton, unbanButton, noteButton);
    const message = await interaction.followUp({ embeds: [embeds[currentPage]], components: [buttonRow1, buttonRow2] });

    const filter = (interaction: Interaction) => interaction.user.id === user;
    const collector = message.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async (interaction: any) => {
        interaction.deferUpdate();

        if (interaction.customId === 'about') {
            currentPage = 0;
        } else if (interaction.customId === 'warns') {
            currentPage = 1;
        } else if (interaction.customId === 'timeouts') {
            currentPage = 2;
        } else if (interaction.customId === 'scamlog') {
            currentPage = 3;
        } else if (interaction.customId === 'bans') {
            currentPage = 4;
        } else if (interaction.customId === 'unbans') {
            currentPage = 5;
        } else if (interaction.customId === 'notes') {
            currentPage = 6;
        }

        updateEmbed();
    });

    function updateEmbed() {
        aboutButton.setStyle(currentPage === 0 ? ButtonStyle.Success : ButtonStyle.Primary);
        warnButton.setStyle(currentPage === 1 ? ButtonStyle.Success : ButtonStyle.Primary);
        timeoutButton.setStyle(currentPage === 2 ? ButtonStyle.Success : ButtonStyle.Primary);
        scamLogButton.setStyle(currentPage === 3 ? ButtonStyle.Success : ButtonStyle.Primary);
        banButton.setStyle(currentPage === 4 ? ButtonStyle.Success : ButtonStyle.Primary);
        unbanButton.setStyle(currentPage === 5 ? ButtonStyle.Success : ButtonStyle.Primary);
        noteButton.setStyle(currentPage === 6 ? ButtonStyle.Success : ButtonStyle.Primary);

        interaction.editReply({ embeds: [embeds[currentPage]], components: [buttonRow1, buttonRow2] });
    }
}
