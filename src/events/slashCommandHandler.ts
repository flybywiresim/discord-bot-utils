import { ApplicationCommandOptionType, CommandInteractionOption, CommandInteractionOptionResolver } from 'discord.js';
import commandArray from '../commands';
import { Color, Events, Reply, SlashCommand, event, makeEmbed } from '../lib';

const commandMap = new Map<string, SlashCommand>();

for (const cmd of commandArray) {
  commandMap.set(cmd.meta.name, cmd);
}

export default event(Events.InteractionCreate, async ({ log, client }, interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (!interaction.inCachedGuild()) {
    await interaction.reply(Reply('This bot can only be used in a server!', Color.Error));
    return;
  }

  try {
    /**
     * @deprecated This is a hacky workaround to use private members of the [CommandInteractionOptionResolver](https://discord.js.org/docs/packages/discord.js/14.15.2/CommandInteractionOptionResolver:Class) class.
     *
     * As minor version updates may break this, we should instead use the public properties to achieve this functionality.
     */
    type ChatInputCommandInteractionWithPrivateFields = Omit<
      CommandInteractionOptionResolver<'cached'>,
      'getMessage' | 'getFocused'
    > & {
      _group: string | null;
      _hoistedOptions: CommandInteractionOption[];
      _subcommand: string | null;
    };

    const { commandName } = interaction;
    const options = interaction.options as ChatInputCommandInteractionWithPrivateFields;

    const command = commandMap.get(commandName);

    if (!command) {
      log(`Could not resolve the command with name "${commandName}"`);
      return;
    }

    let logMessage = `[Command]: ${commandName}`;

    if (options) {
      if (options._group) {
        logMessage += `, Subcommand Group: ${options._group}`;
      }
      if (options._subcommand) {
        logMessage += `, Subcommand: ${options._subcommand}`;
      }
      if (options._hoistedOptions) {
        for (const subcommandOption of options._hoistedOptions) {
          if (subcommandOption.type === ApplicationCommandOptionType.Subcommand) {
            logMessage += `, ${subcommandOption.name}`;
          }
        }
      }
    }

    logMessage += ` was executed by ${interaction.user.tag}`;

    log(logMessage);

    await command.callback({ client, log, interaction });
  } catch (error) {
    const errorEmbed = makeEmbed({
      title: 'An error occurred while executing this command.',
      description: String(error),
      color: Color.Error,
    });

    log('[Command Error]', error);

    await interaction.followUp({ embeds: [errorEmbed] });

    if (interaction.deferred || interaction.replied) {
      log('Interaction was already replied to or deferred, ignoring');
    }
  }
});
