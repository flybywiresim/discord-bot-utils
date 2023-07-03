import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { request } from '@octokit/request';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const syntaxHelp = '\nSyntax:\nA32NX repo: `/pr <id>`\nAny FBW repo: `/pr <repo> <id>`';

const data = slashCommandStructure({
    name: 'pr',
    description: 'Retrieves the link of the provided GitHub pull request.',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'pr_number',
        description: 'Please provide the pull request number.',
        type: ApplicationCommandOptionType.String,
        max_length: 100,
        required: true,
    },
    {
        name: 'repo',
        description: 'Please provide the repo name.',
        type: ApplicationCommandOptionType.String,
        max_length: 100,
        required: false,
    },
    ],
});

const noQueryEmbed = makeEmbed({
    title: 'PR Error | Missing Query',
    description: `Invalid command!${syntaxHelp}`,
    color: Colors.Red,
});

const invalidEmbed = makeEmbed({
    title: 'PR Error | Invalid',
    description: `Something went wrong! Did you provide the correct repo/PR id?${syntaxHelp}`,
    color: Colors.Red,
});

export default slashCommand(data, async ({ interaction }) => {
    const prNumber = interaction.options.getString('pr_number');
    const repoName = interaction.options.getString('repo');

    if (!prNumber) return interaction.reply({ embeds: [noQueryEmbed] });

    const cleanedPrNumber = prNumber.replace('#', '');

    if (repoName) {
        try {
            const response = await request('GET /repos/flybywiresim/{repo}/pulls/{pull_number}', {
                repo: repoName,
                pull_number: cleanedPrNumber,
            });
            return interaction.reply(response.data.html_url);
        } catch {
            return interaction.reply({ embeds: [invalidEmbed] });
        }
    } else {
        try {
            const response = await request('GET /repos/flybywiresim/a32nx/pulls/{pull_number}', { pull_number: cleanedPrNumber });
            return interaction.reply(response.data.html_url);
        } catch {
            return interaction.reply({ embeds: [invalidEmbed] });
        }
    }
});
