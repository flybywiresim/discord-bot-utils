import { Color, SlashCommand, event, Events, makeEmbed } from '../lib';
import commandArray from '../commands';

/* eslint-disable no-underscore-dangle */

const commandMap = new Map<string, SlashCommand>();

for (const cmd of commandArray) {
    commandMap.set(cmd.meta.name, cmd);
}

export default event(Events.InteractionCreate, async ({ log, client }, interaction) => {
    if (!interaction.isAutocomplete()) {
        return;
    }

    if (!interaction.inCachedGuild()) {
        return;
    }

    try {
        const { commandName } = interaction as {
            commandName: any;
            options: any;
        };

        const command = commandMap.get(commandName);

        if (!command) {
            log(`Could not resolve the command with name "${commandName}"`);
            return;
        }

        if (!command.autocompleteCallback) {
            log(`Command has no autocomplete, ignoring. Command: ${command.meta.name}`);
            return;
        }

        await command.autocompleteCallback({ client, log, interaction });
    } catch (error) {
        const errorEmbed = makeEmbed({
            title: 'An error occurred while trying to auto-complete.',
            description: `${error}`,
            color: Color.Error,
        });

        log('[Autocomplete Error]', error);

        await interaction.channel?.send({ embeds: [errorEmbed] });
    }
});
