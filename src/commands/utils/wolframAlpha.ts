import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed, makeLines, Logger } from '../../lib';

const data = slashCommandStructure({
  name: 'wolframalpha',
  description: 'Queries the Wolfram Alpha API.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'query',
      description: 'Please provide a query. For example: `.wa How much is 1 + 1?`.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
});

const noQueryEmbed = makeEmbed({
  title: 'Wolfram Alpha Error | Missing Query',
  description: 'Please provide a query. For example: `.wa How much is 1 + 1?`',
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
    return interaction.followUp({ embeds: [noTokenEmbed], ephemeral: true });
  }

  const query = interaction.options.getString('query');

  if (!query) return interaction.followUp({ embeds: [noQueryEmbed], ephemeral: true });

  const params = {
    appid: wolframAlphaToken,
    input: query,
    format: 'plaintext',
    output: 'JSON',
  };

  const searchParams = new URLSearchParams(params);

  try {
    const response = await fetch(`${WOLFRAMALPHA_API_URL}${searchParams.toString()}`).then((res) => res.json());

    if (response.error) {
      const errorEmbed = makeEmbed({
        title: 'Wolfram Alpha Error',
        description: response.error,
        color: Colors.Red,
      });
      return interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }

    if (response.queryresult.success === true) {
      const podTexts: string[] = [];
      response.queryresult.pods.forEach((pod: any) => {
        if (pod.id !== 'Input' && pod.primary === true) {
          const results: string[] = [];
          pod.subpods.forEach((subpod: any) => {
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

        return interaction.followUp({ embeds: [waEmbed] });
      }
      const noResultsEmbed = makeEmbed({
        title: 'Wolfram Alpha Error | No Results',
        description: makeLines(['No results were found for your query.']),
        color: Colors.Red,
      });
      return interaction.followUp({ embeds: [noResultsEmbed], ephemeral: true });
    }
    const obscureQueryEmbed = makeEmbed({
      title: 'Wolfram Alpha Error | Could not understand query',
      description: makeLines(['Wolfram Alpha could not understand your query.']),
      color: Colors.Red,
    });
    return interaction.followUp({ embeds: [obscureQueryEmbed], ephemeral: true });
  } catch (e) {
    Logger.error('wolframalpha:', e);
    const fetchErrorEmbed = makeEmbed({
      title: 'Wolfram Alpha | Fetch Error',
      description: 'There was an error fetching your request. Please try again later.',
      color: Colors.Red,
    });
    return interaction.followUp({ embeds: [fetchErrorEmbed], ephemeral: true });
  }
});
