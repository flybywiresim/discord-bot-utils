import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { Panel } from '../panels/panel';
import { makeEmbed } from '../../../../lib';

const invalidTargetEmbed = makeEmbed({
    title: 'Locate - Invalid target',
    description: 'The target you provided is invalid. Please type your search query and choose one from the list.',
    color: Colors.Red,
});

const locateEmbed = (panel: Panel) => makeEmbed({
    title: panel.name,
    url: panel.docsUrl,
    description: `Learn more about the panel and the fligth deck:\n* [Panel Documentation](${panel.docsUrl})\n* [Flight Deck Overview](${panel.flightDeckUrl})`,
    image: { url: panel.imagePath },
    footer: { text: 'Tip: Click the image to view in full size' },
});

export const handleCommand = async (interaction: ChatInputCommandInteraction<'cached'>, panelMap: Map<string, Panel>) => {
    const target = interaction.options.getString('target');

    if (!target) return interaction.editReply({ content: 'Please provide a switch, system or panel that you want to locate.' });

    if (!Array.from(panelMap.keys()).includes(target)) {
        return interaction.editReply({ embeds: [invalidTargetEmbed] });
    }
    const panel = panelMap.get(target)!;

    return interaction.editReply({ embeds: [locateEmbed(panel)] });
};
