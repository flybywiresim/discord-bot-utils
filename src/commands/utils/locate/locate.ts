import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { Panel } from './panels/panel';
import { a32nxPanels } from './panels/a32nx/a32nx-panels';
import { slashCommand, slashCommandStructure } from '../../../lib';
import { AutocompleteCallback } from '../../../lib/autocomplete';
import { filterSeachResults } from './functions/filterSearchResults';
import { handleCommand } from './functions/handleCommand';

const a32nxPanelMap: Map<string, Panel> = new Map();
for (const panel of a32nxPanels) {
    for (const identifier of panel.identifiers) {
        a32nxPanelMap.set(identifier, panel);
    }
}

const data = slashCommandStructure({
    name: 'locate',
    description: 'Locate any switch or panel on the flight decks of our aircraft.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'a32nx',
            description: 'Locate any switch or panel on the A32NX flight deck.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'target',
                    description: 'Specify the component to locate.',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true,
                },
            ],
        },
    ],
});

const autocompleteCallback: AutocompleteCallback = ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getString('target')!;

    // If target is empty, trigger 'no values match your query' UI state in discord client.
    if (target.length < 1) return interaction.respond([]);

    let choices: ApplicationCommandOptionChoiceData<string | number>[];
    if (subcommand === 'a32nx') {
        choices = filterSeachResults(target, a32nxPanelMap);
    } else {
        return interaction.respond([]);
    }

    return interaction.respond(choices);
};

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
    case 'a32nx':
        await handleCommand(interaction, a32nxPanelMap);
        break;
    /* case 'a380x':
        await handleCommand(interaction, a380xPanelMap);
        break;
    */
    default:
        await interaction.editReply({ content: 'Unknown subcommand' });
    }
}, autocompleteCallback);
