import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
    name: 'doc-search',
    description: 'Searches the FlyByWire Documentation for a given query.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'query',
            description: 'The query to search for.',
            type: ApplicationCommandOptionType.String,
            max_length: 100,
            required: true,
        },
    ],
});

const DOCS_BASE_URL = 'https://docs.flybywiresim.com';

const profanityMatcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

export default slashCommand(data, async ({ interaction }) => {
    const query = interaction.options.getString('query')!;

    // Separates the query into  an array.
    const words = query.split(/\s+/);

    // Itterate through the array and check if any of the words are a URL. Then check if any of the words are profanity.
    for (const searchWord of words) {
        try {
            const _ = new URL(searchWord);
            const URLEmbed = makeEmbed({
                title: 'FlyByWire Documentation | Error',
                description: 'Providing URLs to the Documentation search command is not allowed.',
                color: Colors.Red,
            });
            return interaction.reply({ embeds: [URLEmbed] });
        } catch (_) {
            /**/
        }

        if (profanityMatcher.hasMatch(searchWord)) {
            const profanityEmbed = makeEmbed({
                title: 'FlyByWire Documentation | Error',
                description: 'Providing profanity to the Documentation search command is not allowed.',
                color: Colors.Red,
            });

            return interaction.reply({ embeds: [profanityEmbed] });
        }
    }

    // Safety to prevent users from entering unexpected data that might result in strange behavior in a URL.
    const encodedSearchQuery = encodeURIComponent(query);

    const queryEmbed = makeEmbed({
        title: 'FlyByWire Documentation Search',
        description: `Search the FlyByWire Documentation for "${query}" [here](${DOCS_BASE_URL}/?q=${encodedSearchQuery}).`,
    });
    return interaction.reply({ embeds: [queryEmbed] });
});
