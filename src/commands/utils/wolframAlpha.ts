import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { z, ZodError } from 'zod';
import { fetchForeignAPI, Logger, makeEmbed, makeLines, slashCommand, slashCommandStructure, WolframAlphaData, WolframAlphaDataSchema, WolframAlphaPodSchema, WolframAlphaSubpodSchema } from '../../lib';

type Pod = z.infer<typeof WolframAlphaPodSchema>;
type Subpod = z.infer<typeof WolframAlphaSubpodSchema>;

const data = slashCommandStructure({
    name: 'wolframalpha',
    description: 'Queries the Wolfram Alpha API.',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'query',
        description: 'Please provide a query. For example: `.wa How much is 1 + 1?`.',
        type: ApplicationCommandOptionType.String,
        required: true,
    }],
});

const noQueryEmbed = makeEmbed({
    title: 'Wolfram Alpha Error | Missing Query',
    description: 'Please provide a query. For example: `.wa How much is 1 + 1?`',
    color: Colors.Red,
});

const errorEmbed = (error: string) => makeEmbed({
    title: 'Wolfram Alpha Error',
    description: error,
    color: Colors.Red,
});

const WOLFRAMALPHA_API_URL = 'https://api.wolframalpha.com/v2/query?';
const WOLFRAMALPHA_QUERY_URL = 'https://www.wolframalpha.com/input/?';

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply();

    const wolframAlphaToken = process.env.WOLFRAMALPHA_TOKEN;

    if (!wolframAlphaToken) {
        const noTokenEmbed = makeEmbed({
            title: 'Error | Wolfram Alpha',
            description: 'Wolfram Alpha token not found.',
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [noTokenEmbed] });
    }

    const query = interaction.options.getString('query');

    if (!query) return interaction.editReply({ embeds: [noQueryEmbed] });

    const params = {
        appid: wolframAlphaToken,
        input: query,
        format: 'plaintext',
        output: 'JSON',
    };

    const searchParams = new URLSearchParams(params);

    let response: WolframAlphaData;
    try {
        response = await fetchForeignAPI(`${WOLFRAMALPHA_API_URL}${searchParams.toString()}`, WolframAlphaDataSchema);
    } catch (e) {
        if (e instanceof ZodError) {
            return interaction.editReply({ embeds: [errorEmbed('Wolfram Alpha returned unknown data.')] });
        }
        Logger.error(`Error while fetching from Wolfram Alpha: ${String(e)}`);
        return interaction.editReply({ embeds: [errorEmbed('An error occurred while fetching from Wolfram Alpha.')] });
    }

    if (response.queryresult.success === true) {
        const podTexts: string[] = [];
        response.queryresult.pods.forEach((pod: Pod) => {
            if (pod.id !== 'Input' && pod.primary === true) {
                const results: string[] = [];
                pod.subpods.forEach((subpod: Subpod) => {
                    results.push(subpod.plaintext);
                });
                if (results.length > 0) {
                    podTexts.push(`**${pod.title}:** \n${results.join('\n')}`);
                }
            }
        });
        if (podTexts.length > 0) {
            const result = podTexts.join('\n\n');
            const queryParams = new URLSearchParams({ i: query });

            const waEmbed = makeEmbed({
                description: makeLines([
                    `**Query:** ${query}`,
                    '',
                    result,
                    '',
                    `[Web Result](${WOLFRAMALPHA_QUERY_URL}${queryParams.toString()})`,
                ]),
            });

            return interaction.editReply({ embeds: [waEmbed] });
        }
        const noResultsEmbed = makeEmbed({
            title: 'Wolfram Alpha Error | No Results',
            description: makeLines([
                'No results were found for your query.',
            ]),
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [noResultsEmbed] });
    }

    const obscureQueryEmbed = makeEmbed({
        title: 'Wolfram Alpha Error | Could not understand query',
        description: makeLines([
            'Wolfram Alpha could not understand your query.',
        ]),
        color: Colors.Red,
    });
    return interaction.editReply({ embeds: [obscureQueryEmbed] });
});
