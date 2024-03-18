import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { request } from '@octokit/request';
import { makeEmbed } from '../../../../lib';

const syntaxHelp = '\nSyntax:\nA32NX repo: `/github issue <id>`\nAny FBW repo: `/github issue <repo> <id>`';

const noQueryEmbed = makeEmbed({
    title: 'Issue Error | Missing Query',
    description: `Invalid command!${syntaxHelp}`,
    color: Colors.Red,
});

const invalidEmbed = makeEmbed({
    title: 'Issue Error | Invalid',
    description: `Something went wrong! Did you provide the correct repo/PR id?${syntaxHelp}`,
    color: Colors.Red,
});
export async function handleGithubIssue(interaction: ChatInputCommandInteraction<'cached'>) {
    const issueNumber = interaction.options.getString('issue_number');
    const repoName = interaction.options.getString('repo');

    if (!issueNumber) return interaction.reply({ embeds: [noQueryEmbed] });

    const cleanedIssueNumber = issueNumber.replace('#', '');

    if (repoName) {
        try {
            const response = await request('GET /repos/flybywiresim/{repo}/issues/{pull_number}', {
                repo: repoName,
                pull_number: cleanedIssueNumber,
            });
            return interaction.reply(response.data.html_url);
        } catch {
            return interaction.reply({ embeds: [invalidEmbed] });
        }
    } else {
        try {
            const response = await request('GET /repos/flybywiresim/a32nx/issues/{pull_number}', { pull_number: cleanedIssueNumber });
            return interaction.reply(response.data.html_url);
        } catch {
            return interaction.reply({ embeds: [invalidEmbed] });
        }
    }
}
