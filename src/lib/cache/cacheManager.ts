import { Cache, caching } from 'cache-manager';
import { getConn, Logger, PrefixCommand, PrefixCommandCategory, PrefixCommandChannelDefaultVersion, PrefixCommandVersion } from '../index';

let inMemoryCache: Cache;
const commandCachePrefix = 'PF_COMMAND';
const commandVersionCachePrefix = 'PF_VERSION';
const cacheSize = 10000;
const cacheRefreshInterval = process.env.CACHE_REFRESH_INTERVAL ? Number(process.env.CACHE_REFRESH_INTERVAL) : 1800;
const cacheTTL = cacheRefreshInterval * 2 * 1000;

/**
 * Cache Management Functions
 */

export async function setupInMemoryCache(callback = Logger.error) {
    try {
        inMemoryCache = await caching(
            'memory',
            {
                ttl: cacheTTL,
                max: cacheSize,
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

/**
 * Prefix Command Cache Management Functions
 */

export async function clearSinglePrefixCommandCache(commandName: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Clearing cache for command or alias "${commandName}"`);
    const commandCache = await inMemoryCache.get(`${commandCachePrefix}:${commandName.toLowerCase()}`);
    const command = PrefixCommand.hydrate(commandCache);
    if (!command) return;
    const { aliases } = command;
    for (const alias of aliases) {
        // eslint-disable-next-line no-await-in-loop
        await inMemoryCache.del(`${commandCachePrefix}:${alias.toLowerCase()}`);
    }
    await inMemoryCache.del(`${commandCachePrefix}:${commandName.toLowerCase()}`);
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

export async function loadSinglePrefixCommandToCache(command: Object, name: string, aliases: string[]) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Loading command ${name} to cache`);
    await inMemoryCache.set(`${commandCachePrefix}:${name.toLowerCase()}`, command);
    for (const alias of aliases) {
        // eslint-disable-next-line no-await-in-loop
        await inMemoryCache.set(`${commandCachePrefix}:${alias.toLowerCase()}`, command);
    }
}

export async function loadAllPrefixCommandsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommands = await PrefixCommand.find();

    for (const command of PrefixCommands) {
        const { name, aliases } = command;
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandToCache(command.toObject(), name, aliases);
    }
}

export async function refreshSinglePrefixCommandCache(oldName: string, command: Object, newName: string, newAliases: string[]) {
    await clearSinglePrefixCommandCache(oldName);
    await loadSinglePrefixCommandToCache(command, newName, newAliases);
}

export async function refreshAllPrefixCommandsCache() {
    await clearAllPrefixCommandsCache();
    await loadAllPrefixCommandsToCache();
}

/**
 * Prefix Command Version Cache Management Functions
 */

export async function clearSinglePrefixCommandVersionCache(alias: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Clearing cache for command version alias "${alias}"`);
    await inMemoryCache.del(`${commandVersionCachePrefix}:${alias.toLowerCase()}`);
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

export async function loadSinglePrefixCommandVersionToCache(version: Object, alias: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Loading version with alias ${alias} to cache`);
    await inMemoryCache.set(`${commandVersionCachePrefix}:${alias.toLowerCase()}`, version);
}

export async function loadAllPrefixCommandVersionsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommandVersions = await PrefixCommandVersion.find();

    for (const version of PrefixCommandVersions) {
        const { alias } = version;
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandVersionToCache(version.toObject(), alias);
    }
}

export async function refreshSinglePrefixCommandVersionCache(oldAlias: string, version: Object, newAlias: string) {
    await clearSinglePrefixCommandVersionCache(oldAlias);
    await loadSinglePrefixCommandVersionToCache(version, newAlias);
}

export async function refreshAllPrefixCommandVersionsCache() {
    await clearAllPrefixCommandVersionsCache();
    await loadAllPrefixCommandVersionsToCache();
}

/**
 * Prefix Command Category Cache Management Functions
 */

export async function clearSinglePrefixCommandCategoryCache(name: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Clearing cache for command category "${name}"`);
    await inMemoryCache.del(`PF_CATEGORY:${name.toLowerCase()}`);
}

export async function clearAllPrefixCommandCategoriesCache() {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const keys = await inMemoryCache.store.keys();
    for (const key of keys) {
        if (key.startsWith('PF_CATEGORY:')) {
            Logger.debug(`Clearing cache for command category "${key}"`);
            // eslint-disable-next-line no-await-in-loop
            await inMemoryCache.del(key);
        }
    }
}

export async function loadSinglePrefixCommandCategoryToCache(category: Object, name: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Loading category ${name} to cache`);
    await inMemoryCache.set(`PF_CATEGORY:${name.toLowerCase()}`, category);
}

export async function loadAllPrefixCommandCategoriesToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommandCategories = await PrefixCommandCategory.find();

    for (const category of PrefixCommandCategories) {
        const { name } = category;
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandCategoryToCache(category.toObject(), name);
    }
}

export async function refreshSinglePrefixCommandCategoryCache(oldName: string, category: Object, newName: string) {
    await clearSinglePrefixCommandCategoryCache(oldName);
    await loadSinglePrefixCommandCategoryToCache(category, newName);
}

export async function refreshAllPrefixCommandCategoriesCache() {
    await clearAllPrefixCommandCategoriesCache();
    await loadAllPrefixCommandCategoriesToCache();
}

/**
 * Prefix Command Channel Default Version Cache Management Functions
 */

export async function clearSinglePrefixCommandChannelDefaultVersionCache(channelId: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Clearing cache for channel default version for channel "${channelId}"`);
    await inMemoryCache.del(`PF_CHANNEL_VERSION:${channelId}`);
}

export async function clearAllPrefixCommandChannelDefaultVersionsCache() {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const keys = await inMemoryCache.store.keys();
    for (const key of keys) {
        if (key.startsWith('PF_CHANNEL_VERSION:')) {
            Logger.debug(`Clearing cache for channel default version for channel "${key}"`);
            // eslint-disable-next-line no-await-in-loop
            await inMemoryCache.del(key);
        }
    }
}

export async function loadSinglePrefixCommandChannelDefaultVersionToCache(version: Object, channelId: string) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    Logger.debug(`Loading default version for channel ${channelId} to cache`);
    await inMemoryCache.set(`PF_CHANNEL_VERSION:${channelId}`, version);
}

export async function loadAllPrefixCommandChannelDefaultVersionsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommandChannelDefaultVersions = await PrefixCommandChannelDefaultVersion.find();

    for (const defaultVersion of PrefixCommandChannelDefaultVersions) {
        const { channelId, versionId } = defaultVersion;
        // eslint-disable-next-line no-await-in-loop
        const version = await PrefixCommandVersion.findById(versionId);
        if (version) {
            // eslint-disable-next-line no-await-in-loop
            await loadSinglePrefixCommandChannelDefaultVersionToCache(version.toObject(), channelId);
        }
    }
}

export async function refreshSinglePrefixCommandChannelDefaultVersionCache(channelId: string, version: Object) {
    await clearSinglePrefixCommandChannelDefaultVersionCache(channelId);
    await loadSinglePrefixCommandChannelDefaultVersionToCache(version, channelId);
}

export async function refreshAllPrefixCommandChannelDefaultVersionsCache() {
    await clearAllPrefixCommandChannelDefaultVersionsCache();
    await loadAllPrefixCommandChannelDefaultVersionsToCache();
}
