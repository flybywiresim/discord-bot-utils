import type { Awaitable, Client, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { LogMethods } from './index';

/// Props that will be passed through the command callback.
export interface SlashCommandProps {
    interaction: ChatInputCommandInteraction<'cached'>,
    client: Client,
    log: LogMethods,
}
export type SlashCommandCallback = (props: SlashCommandProps) => Awaitable<unknown>;

/// Command structure for slash commands
export type SlashCommandStructure =
    | SlashCommandBuilder & { category?: string }
    | SlashCommandSubcommandsOnlyBuilder & { category?: string }
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> & { category?: string }
    | RESTPostAPIApplicationCommandsJSONBody & { category?: string };

/// Internal structure that represents a command and its callback.
export interface SlashCommand {
    meta: SlashCommandStructure,
    callback: SlashCommandCallback,
}

/// Function to provide data for slash commands
export function slashCommandStructure(data: RESTPostAPIApplicationCommandsJSONBody & { category?: string }): SlashCommandStructure {
    return data;
}

/// Creates command structure
export function slashCommand(meta: SlashCommandStructure, callback: SlashCommandCallback): SlashCommand {
    return { meta, callback };
}
