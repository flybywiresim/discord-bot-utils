import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { Panel } from '../panels/panel';
import { makeEmbed } from '../../../../lib';

const emptyTargetEmbed = makeEmbed({
    title: 'Locate - Empty target',
    description: 'Please provide a switch, system or panel that you want to locate.',
    color: Colors.Red,
});

const invalidTargetEmbed = makeEmbed({
    title: 'Locate - Invalid target',
    description: 'The target you provided is invalid. Please type your search query and choose one from the list.',
    color: Colors.Red,
});

const locateEmbed = (panel: Panel) => makeEmbed({
    title: panel.title,
    url: panel.docsUrl,
    description: `Learn more about the ${panel.name} and the fligth deck:\n* [${panel.name} Documentation](${panel.docsUrl})\n* [Flight Deck Overview](${panel.flightDeckUrl})`,
    image: { url: panel.imagePath },
    footer: { text: 'Tip: Click the image to view in full size' },
});

export const handleCommand = async (interaction: ChatInputCommandInteraction<'cached'>, panelMap: Map<string, Panel>) => {
    const target = interaction.options.getString('target');

    if (!target) return interaction.editReply({ embeds: [emptyTargetEmbed] });

    // Replace whitespace characters with a hyphen.
    const cleanTarget = target.replace(/\s/g, '-');

    if (!Array.from(panelMap.keys()).includes(cleanTarget)) {
        return interaction.editReply({ embeds: [invalidTargetEmbed] });
    }
    const panel = panelMap.get(cleanTarget)!;

    return interaction.editReply({ embeds: [locateEmbed(panel)] });
};
