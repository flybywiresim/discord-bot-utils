import { AutocompleteInteraction, Awaitable, Client } from 'discord.js';
import { LogMethods } from './index';

/// Props that will be passed through the autocomplete callback.
export interface AutocompleteProps {
    interaction: AutocompleteInteraction<'cached'>;
    client: Client;
    log: LogMethods;
}

export type AutocompleteCallback = (props: AutocompleteProps) => Awaitable<unknown>;
