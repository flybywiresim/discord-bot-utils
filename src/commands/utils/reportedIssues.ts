import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedField } from 'discord.js';
import { JSDOM } from 'jsdom';
import { Logger, makeEmbed, slashCommand, slashCommandStructure } from '../../lib';

const data = slashCommandStructure({
    name: 'reported-issues',
    description: 'Provides a link to the reported issues page within docs.',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'query',
        description: 'Provide a query to search for.',
        type: ApplicationCommandOptionType.String,
        max_length: 100,
        required: true,
    }],
});

const FBW_DOCS_REPORTED_ISSUES_URL = 'https://docs.flybywiresim.com/fbw-a32nx/support/reported-issues/';
const FBW_DOCS_AUTOPILOT_ISSUES_URL = 'https://docs.flybywiresim.com/fbw-a32nx/feature-guides/autopilot-fbw/#typical-issues-and-how-to-solve-them';
const FBW_DOCS_SIMBRIDGE_ISSUES_URL = 'https://docs.flybywiresim.com/simbridge/troubleshooting/';

const genericReportedIssuesEmbed = makeEmbed({
    title: 'FlyByWire A32NX | Reported Issues',
    description: `I couldn't find a match foy your query. Please see [this link](${FBW_DOCS_REPORTED_ISSUES_URL}) for a current list of reported issues.`,
});

const issueInSubsectionEmbed = (fields: EmbedField[]) => makeEmbed({
    title: 'FlyByWire A32NX | Reported Issues',
    description: 'Your issue is in our reported issues list. Please try the possible solutions in the following link(s) and report back if they didn\'t help. Include all the steps you tried.',
    fields,
});

const subsectionLinkEmbedField = (id: string, title: string): EmbedField[] => [
    {
        inline: false,
        name: `${title}`,
        value: `[Link to reported issues section](${FBW_DOCS_REPORTED_ISSUES_URL}#${id})`,
    },
];

const autopilotEmbed = makeEmbed({
    title: 'FlyByWire A32NX | Reported Issues',
    description: `Please see [this link](${FBW_DOCS_AUTOPILOT_ISSUES_URL}) for typical issues with the custom autopilot and how to solve them.`,
});

const simbridgeEmbed = makeEmbed({
    title: 'FlyByWire A32NX | Reported Issues',
    description: `Please see [this link](${FBW_DOCS_SIMBRIDGE_ISSUES_URL}) for typical issues with simbridge and how to solve them.`,
});

const generalTroubleshootingEmbed = makeEmbed({
    title: 'FlyByWire A32NX | Reported Issues',
    description: 'Please try the general troubleshooting steps from our reported issues page and report back if they didn\'t help. Include all the steps you tried.',
    fields: [{
        inline: false,
        name: 'General Troubleshooting Steps',
        value: `[Link to reported issues section](${FBW_DOCS_REPORTED_ISSUES_URL}#general-troubleshooting-steps)`,
    }],
});

const tooManyResultsEmbed = makeEmbed({
    title: 'FlyByWire A32NX | Error',
    description: 'The search term returned too many results',
    color: Colors.Red,
});

export default slashCommand(data, async ({ interaction }) => {
    const query = interaction.options.getString('query')!;

    const lowercaseQuery = query.toLowerCase();

    const words = lowercaseQuery.split(/\s+/);

    if (words.length === 1) {
        if (lowercaseQuery === 'autopilot') {
            return interaction.reply({ embeds: [autopilotEmbed] });
        }
        if (lowercaseQuery === 'simbridge') {
            return interaction.reply({ embeds: [simbridgeEmbed] });
        }
        if (lowercaseQuery === 'troubleshooting') {
            return interaction.reply({ embeds: [generalTroubleshootingEmbed] });
        }
    }

    try {
        const reportedIssues: any = [];
        const dom = await JSDOM.fromURL(`${FBW_DOCS_REPORTED_ISSUES_URL}`);
        const { document } = dom.window;
        const h3Elements = document.querySelectorAll('h3');
        h3Elements.forEach((element) => {
            const { id } = element;
            if (words.every((searchWord) => id.includes(searchWord))) {
                reportedIssues.push({ id, title: element.textContent });
            }
        });

        if (reportedIssues.length === 0 || reportedIssues.length > 4) {
            if (reportedIssues.length > 4) {
                return interaction.reply({ embeds: [tooManyResultsEmbed] });
            }
            return interaction.reply({ embeds: [genericReportedIssuesEmbed] });
        }

        const fields = reportedIssues.map((sectionElement: any) => subsectionLinkEmbedField(sectionElement.id, sectionElement.title)).flat();
        return interaction.reply({ embeds: [issueInSubsectionEmbed(fields)] });
    } catch (error: any) {
        Logger.error(error);
        Logger.error(error.stack);
        const errorEmbed = makeEmbed({
            title: 'Error | Reported Issues',
            description: error.message,
            color: Colors.Red,
        });
        return interaction.reply({ embeds: [errorEmbed] });
    }
});
