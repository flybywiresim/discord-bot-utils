import {
    Awaitable,
    Client,
    ContextMenuCommandBuilder,
    RESTPostAPIApplicationCommandsJSONBody, ContextMenuCommandInteraction,
} from 'discord.js';
import { LogMethods } from './index';

export interface ContextMenuCommandProps {
    interaction: ContextMenuCommandInteraction<'cached'>;
    client: Client;
    log: LogMethods;
}

export type ContextMenuCommandCallback = (props: ContextMenuCommandProps) => Awaitable<unknown>;

export type ContextMenuCommandStructure =
    | ContextMenuCommandBuilder
    | RESTPostAPIApplicationCommandsJSONBody

export interface ContextMenuCommand {
    meta: ContextMenuCommandStructure;
    callback: ContextMenuCommandCallback;
}

export function contextMenuCommandStructure(data: RESTPostAPIApplicationCommandsJSONBody): ContextMenuCommandStructure {
    return data;
}

export function contextMenuCommand(meta: ContextMenuCommandStructure, callback: ContextMenuCommandCallback): ContextMenuCommand {
    return { meta, callback };
}
