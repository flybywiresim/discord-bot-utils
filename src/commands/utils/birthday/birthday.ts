import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import { constantsConfig, getConn, makeEmbed, slashCommand, slashCommandStructure } from '../../../lib';
import { handleSetBirthday } from './functions/setBirthday';
import { handleListBirthday } from './functions/listBirthday';
import { handleRemoveBirthday } from './functions/removeBirthday';

const data = slashCommandStructure({
  name: 'birthday',
  description: 'Command to manage birthdays.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Needs overrides adding for team members and lock to birthday thread
  dm_permission: false,
  options: [
    {
      name: 'set',
      description: 'Sets your birthday.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'day',
          description: 'The day of your birthday.',
          type: ApplicationCommandOptionType.Integer,
          min_value: 1,
          max_value: 31,
          required: true,
        },
        {
          name: 'month',
          description: 'The month of your birthday.',
          type: ApplicationCommandOptionType.Integer,
          required: true,
          choices: [
            { name: 'January', value: 1 },
            { name: 'February', value: 2 },
            { name: 'March', value: 3 },
            { name: 'April', value: 4 },
            { name: 'May', value: 5 },
            { name: 'June', value: 6 },
            { name: 'July', value: 7 },
            { name: 'August', value: 8 },
            { name: 'September', value: 9 },
            { name: 'October', value: 10 },
            { name: 'November', value: 11 },
            { name: 'December', value: 12 },
          ],
        },
        {
          name: 'timezone',
          description: 'Your timezone in relation to UTC. e.g. 2 or -6.',
          type: ApplicationCommandOptionType.Integer,
          max_value: +14,
          min_value: -12,
          required: true,
        },
      ],
    },
    {
      name: 'remove',
      description: 'Removes your birthday.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'list',
      description: 'Lists all birthdays.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
});

const noConnEmbed = makeEmbed({
  title: 'Birthday - No Connection',
  description: 'Could not connect to the database',
  color: Colors.Red,
});

export default slashCommand(data, async ({ interaction }) => {
  const conn = getConn();

  if (!conn) {
    await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
    return;
  }

  const subcommandName = interaction.options.getSubcommand();

  switch (subcommandName) {
    case 'set':
      await handleSetBirthday(interaction);
      break;
    case 'remove':
      await handleRemoveBirthday(interaction);
      break;
    case 'list':
      await handleListBirthday(interaction);
      break;

    default:
      await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
  }
});
