import type { ClientEvents, Awaitable, Client } from 'discord.js';
import { Logger } from './index';

export { Events } from 'discord.js';

export type LogMethods = (...args: unknown[]) => void;
export type EventKeys = keyof ClientEvents;

export interface EventProps {
    client: Client;
    log: LogMethods;
}

export type EventCallback<T extends EventKeys> = (
    props: EventProps,
    ...args: ClientEvents[T]
) => Awaitable<unknown>;

export interface Event<T extends EventKeys = EventKeys> {
    key: T;
    callback: EventCallback<T>;
}

export function event<T extends EventKeys>(key: T, callback: EventCallback<T>): Event<T> {
    return { key, callback };
}

export function registerEvents(client: Client, events: Event[]): void {
    for (const { key, callback } of events) {
        client.on(key, (...args) => {
            const log = console.log.bind(Logger, `[Event: ${key}]`);

            try {
                callback({ client, log }, ...args);
            } catch (e) {
                log('[Uncaught Error]', e);
            }
        });
    }
}
