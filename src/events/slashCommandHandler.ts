import { Color, SlashCommand, event, Events, Reply } from '../lib';
import commandArray from '../commands';

/* eslint-disable no-underscore-dangle */

const commandMap = new Map<string, SlashCommand>();

for (const cmd of commandArray) {
    commandMap.set(cmd.meta.name, cmd);
}

export default event(Events.InteractionCreate, async ({ log, client }, interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (!interaction.inCachedGuild()) {
        await interaction.reply(
            Reply('This bot can only be used in a server!', Color.Error),
        );
        return;
    }

    try {
        const { commandName, options } = interaction as{
            commandName: any;
            options: any;
        };

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
                    if (subcommandOption.type === 1) {
                        logMessage += `, ${subcommandOption.name}`;
                    }
                }
            }
        }

        logMessage += ` was executed by ${interaction.user.tag}`;

        log(logMessage);

        await command.callback({ client, log, interaction });
    } catch (error) {
        log('[Command Error]', error);

        if (interaction.deferred || interaction.replied) {
            log('Interaction was already replied to or deferred, ignoring');
        }
    }
});
