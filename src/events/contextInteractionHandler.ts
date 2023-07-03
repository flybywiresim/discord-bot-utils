import { Color, ContextMenuCommand, event, Events, Reply } from '../lib';
import contextArray from '../commands/context';

const contextMap = new Map<string, ContextMenuCommand>(
    contextArray.map((c) => [c.meta.name, c]),
);

export default event(Events.InteractionCreate, async ({ log, client }, interaction) => {
    if (!interaction.isContextMenuCommand()) {
        return;
    }

    if (!interaction.inCachedGuild()) {
        await interaction.reply(
            Reply('This bot can only be used in a server!', Color.Error),
        );
        return;
    }

    try {
        const contextName = interaction.commandName;
        const context = contextMap.get(contextName);

        if (!context) {
            log(`Could not resolve the context with name "${contextName}"`);
            return;
        }

        log(`[Context Command]: ${contextName} was executed by ${interaction.user.tag}`);

        await context.callback({ client, log, interaction });
    } catch (error) {
        log('[Context Error]', error);

        if (interaction.deferred || interaction.replied) {
            log('Interaction was already replied to or deferred, ignoring');
        }
    }
});
