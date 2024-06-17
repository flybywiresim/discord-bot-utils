import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { slashCommand, slashCommandStructure } from '../../../lib';
import { handleGithubPullRequest } from './functions/githubPullRequest';
import { handleGithubIssue } from './functions/handleGithubIssue';

const data = slashCommandStructure({
  name: 'github',
  description: 'Retrieve links for a GitHub pull request or issue.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'pr',
      description: 'Retrieves the link of the provided GitHub pull request.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'pr_number',
          description: 'Please provide the pull request number.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'repo',
          description: 'Please provide the repo name.',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: 'issue',
      description: 'Retrieves the link of the provided GitHub issue.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'issue_number',
          description: 'Please provide the issue number.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'repo',
          description: 'Please provide the repo name.',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
  ],
});

export default slashCommand(data, async ({ interaction }) => {
  const subcommandName = interaction.options.getSubcommand();

  switch (subcommandName) {
    case 'pr':
      await handleGithubPullRequest(interaction);
      break;
    case 'issue':
      await handleGithubIssue(interaction);
      break;

    default:
      await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
  }
});
