import { Cache, caching } from 'cache-manager';
import { getConn, Logger, PrefixCommand, PrefixCommandVersion } from '../index';

let inMemoryCache: Cache;
const commandCachePrefix = 'PF_COMMAND';
const commandVersionCachePrefix = 'PF_VERSION';

export async function setupInMemoryCache(callback = Logger.error) {
    try {
        inMemoryCache = await caching(
            'memory',
            {
                ttl: 3600 * 1000, // 1 hour caching
                max: 10000, // 10000 items max
            },
        );
        Logger.info('In memory cache set up');
    } catch (err) {
        callback(err);
    }
}

export function getInMemoryCache(callback = Logger.error) {
    if (!inMemoryCache) {
        callback(new Error('No in memory cache available.'));
        return null;
    }
    return inMemoryCache;
}

export async function clearSinglePrefixCommandCache(commandName: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Clearing cache for command or alias "${commandName}"`);
    const commandCache = await inMemoryCache.get(`${commandCachePrefix}:${commandName}`);
    const command = PrefixCommand.hydrate(commandCache);
    if (!command) return;
    const { aliases } = command;
    for (const alias of aliases) {
        // eslint-disable-next-line no-await-in-loop
        await inMemoryCache.del(`${commandCachePrefix}:${alias}`);
    }
    await inMemoryCache.del(`${commandCachePrefix}:${commandName}`);
}

export async function clearSinglePrefixCommandVersionCache(alias: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Clearing cache for command version alias "${alias}"`);
    await inMemoryCache.del(`${commandVersionCachePrefix}:${alias}`);
}

export async function clearAllPrefixCommandsCache() {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const keys = await inMemoryCache.store.keys();
    for (const key of keys) {
        if (key.startsWith(`${commandCachePrefix}:`)) {
            Logger.debug(`Clearing cache for command or alias "${key}"`);
            // eslint-disable-next-line no-await-in-loop
            await inMemoryCache.del(key);
        }
    }
}

export async function clearAllPrefixCommandVersionsCache() {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const keys = await inMemoryCache.store.keys();
    for (const key of keys) {
        if (key.startsWith(`${commandVersionCachePrefix}:`)) {
            Logger.debug(`Clearing cache for command version alias "${key}"`);
            // eslint-disable-next-line no-await-in-loop
            await inMemoryCache.del(key);
        }
    }
}

export async function loadSinglePrefixCommandToCache(command: Object, name: string, aliases: string[]) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Loading command ${name} to cache`);
    await inMemoryCache.set(`${commandCachePrefix}:${name}`, command);
    for (const alias of aliases) {
        // eslint-disable-next-line no-await-in-loop
        await inMemoryCache.set(`${commandCachePrefix}:${alias}`, command);
    }
}

export async function loadSinglePrefixCommandVersionToCache(version: Object, alias: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Loading version with alias ${alias} to cache`);
    await inMemoryCache.set(`${commandVersionCachePrefix}:${alias}`, version);
}

export async function loadAllPrefixCommandsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommands = await PrefixCommand.find();

    for (const command of PrefixCommands) {
        const { name, aliases } = command;
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandToCache(command, name, aliases);
    }
}

export async function loadAllPrefixCommandVersionsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommandVersions = await PrefixCommandVersion.find();

    for (const version of PrefixCommandVersions) {
        const { alias } = version;
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandVersionToCache(version, alias);
    }
}

export async function refreshSinglePrefixCommandCache(oldName: string, command: Object, newName: string, newAliases: string[]) {
    await clearSinglePrefixCommandCache(oldName);
    await loadSinglePrefixCommandToCache(command, newName, newAliases);
}

export async function refreshSinglePrefixCommandVersionCache(oldAlias: string, version: Object, newAlias: string) {
    await clearSinglePrefixCommandVersionCache(oldAlias);
    await loadSinglePrefixCommandVersionToCache(version, newAlias);
}

export async function refreshAllPrefixCommandsCache() {
    await clearAllPrefixCommandsCache();
    await loadAllPrefixCommandsToCache();
}

export async function refreshAllPrefixCommandVersionsCache() {
    await clearAllPrefixCommandVersionsCache();
    await loadAllPrefixCommandVersionsToCache();
}
