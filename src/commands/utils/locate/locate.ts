import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { Panel } from './panels/panel';
import { a32nxPanels } from './panels/a32nx/a32nx-panels';
import { makeEmbed, slashCommand, slashCommandStructure } from '../../../lib';
import { AutocompleteCallback } from '../../../lib/autocomplete';

const a32nxPanelMap: Map<string, Panel> = new Map();
for (const panel of a32nxPanels) {
    for (const identifier of panel.identifiers) {
        a32nxPanelMap.set(identifier, panel);
    }
}

const data = slashCommandStructure({
    name: 'locate',
    description: 'Locate any switch or panel on the flightdeck.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'target',
            description: 'Specify the component to locate',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true,
        },
        {
            name: 'aircraft',
            description: 'Specify the aircraft to locate the component for.',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'A32NX',
                    value: 'A32NX',
                },
                // Add A380X here
            ],
        },
    ],
});

const formatEmbedDescription = (panel: Panel) => `${panel.description} \n\nFor more information please refer to our [docs](${panel.docsUrl}).`;

const formatAutocompleteNames = (value: string) => {
    const parsed = value.split('-');

    const formatted: string[] = [];
    for (const current of parsed) {
        const capitalized = current[0].toUpperCase() + current.substring(1);
        formatted.push(capitalized);
    }

    return formatted.join(' ');
};

const autocompleteCallback: AutocompleteCallback = ({ interaction }) => {
    const target = interaction.options.getString('target')!;

    // If target is empty, trigger 'no values match your query' UI state in discord client.
    if (target.length < 1) return interaction.respond([]);

    console.log('TARGET:', target);

    // Filter search results
    const filteredTargets = Array.from(a32nxPanelMap.keys()).filter((current) => current.toLowerCase().startsWith(target.toLowerCase()));

    console.log('FILTERED TARGET:', filteredTargets);

    // Sort
    filteredTargets.sort((a, b) => a.indexOf(target) - b.indexOf(target));

    console.log('SORTED TARGETS:', filteredTargets);

    const choices: ApplicationCommandOptionChoiceData<string | number>[] = [];
    for (let i = 0; i < Math.min(filteredTargets.length, 26); i++) {
        console.log('CURRENT CHOICE:', filteredTargets[i]);
        choices.push({ name: formatAutocompleteNames(filteredTargets[i]), value: filteredTargets[i] });
    }

    console.log('CHOICES:', choices);

    return interaction.respond(choices);
};

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply({ ephemeral: true });

    const aircraft = interaction.options.getString('aircraft') ?? 'A32NX';
    const target = interaction.options.getString('target');

    if (!aircraft) return interaction.editReply({ content: `Received invalid aircraft: ${aircraft}.` });
    if (!target) return interaction.editReply({ content: `Received invalid target: ${target}` });

    let panel: Panel;
    if (aircraft === 'A32NX') {
        if (!Array.from(a32nxPanelMap.keys()).includes(target)) {
            return interaction.editReply({ content: `Invalid target: ${target}` });
        }

        panel = a32nxPanelMap.get(target)!;
    } else {
        return interaction.editReply({ content: `Invalid aircraft! ${aircraft}` });
    }

    const locateEmbed = makeEmbed({ title: panel.name, description: formatEmbedDescription(panel) });
    return interaction.editReply({ embeds: [locateEmbed] });
}, autocompleteCallback);
