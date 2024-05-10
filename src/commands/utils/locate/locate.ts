import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { Panel } from './panels/panel';
import { a32nxPanels } from './panels/a32nx/a32nx-panels';
import { makeEmbed, slashCommand, slashCommandStructure } from '../../../lib';

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

const formatEmbedDescription = (panel: Panel) => `${panel.description} 
    
    For more information please refer to our [docs](${panel.docsUrl}).`;

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
});
