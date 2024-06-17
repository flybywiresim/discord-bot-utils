import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { request } from '@octokit/request';
import { makeEmbed } from '../../../../lib';

const syntaxHelp = '\nSyntax:\nAircraft repo: `/github pr <id>`\nAny FBW repo: `/github pr <repo> <id>`';

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
export async function handleGithubPullRequest(interaction: ChatInputCommandInteraction<'cached'>) {
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
      const response = await request('GET /repos/flybywiresim/a32nx/pulls/{pull_number}', {
        pull_number: cleanedPrNumber,
      });
      return interaction.reply(response.data.html_url);
    } catch {
      return interaction.reply({ embeds: [invalidEmbed] });
    }
  }
}
