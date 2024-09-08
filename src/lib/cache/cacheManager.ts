import { Cache, caching } from 'cache-manager';
import { getConn, IPrefixCommand, IPrefixCommandCategory, IPrefixCommandChannelDefaultVersion, IPrefixCommandVersion, Logger, PrefixCommand, PrefixCommandCategory, PrefixCommandChannelDefaultVersion, PrefixCommandVersion } from '../index';

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

export async function clearSinglePrefixCommandCache(command: IPrefixCommand) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { name, aliases } = command;
    Logger.debug(`Clearing cache for command or alias "${name}"`);
    for (const alias of aliases) {
        // eslint-disable-next-line no-await-in-loop
        await inMemoryCache.del(`${commandCachePrefix}:${alias.toLowerCase()}`);
    }
    await inMemoryCache.del(`${commandCachePrefix}:${name.toLowerCase()}`);
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

export async function loadSinglePrefixCommandToCache(command: IPrefixCommand) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { name, aliases } = command;
    Logger.debug(`Loading command ${name} to cache`);
    await inMemoryCache.set(`${commandCachePrefix}:${name.toLowerCase()}`, command.toObject());
    for (const alias of aliases) {
        // eslint-disable-next-line no-await-in-loop
        await inMemoryCache.set(`${commandCachePrefix}:${alias.toLowerCase()}`, command.toObject());
    }
}

export async function loadAllPrefixCommandsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommands = await PrefixCommand.find();
    for (const command of PrefixCommands) {
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandToCache(command);
    }
}

export async function refreshSinglePrefixCommandCache(oldCommand: IPrefixCommand, newCommand: IPrefixCommand) {
    await clearSinglePrefixCommandCache(oldCommand);
    await loadSinglePrefixCommandToCache(newCommand);
}

export async function refreshAllPrefixCommandsCache() {
    await clearAllPrefixCommandsCache();
    await loadAllPrefixCommandsToCache();
}

/**
 * Prefix Command Version Cache Management Functions
 */

export async function clearSinglePrefixCommandVersionCache(version: IPrefixCommandVersion) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { alias, _id: versionId } = version;
    Logger.debug(`Clearing cache for command version alias "${alias}"`);
    await inMemoryCache.del(`${commandVersionCachePrefix}:${alias.toLowerCase()}`);
    await inMemoryCache.del(`${commandVersionCachePrefix}:${versionId}`);
}

export async function clearAllPrefixCommandVersionsCache() {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const keys = await inMemoryCache.store.keys();
    for (const key of keys) {
        if (key.startsWith(`${commandVersionCachePrefix}:`)) {
            Logger.debug(`Clearing cache for command version alias/id "${key}"`);
            // eslint-disable-next-line no-await-in-loop
            await inMemoryCache.del(key);
        }
    }
}

export async function loadSinglePrefixCommandVersionToCache(version: IPrefixCommandVersion) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { alias, _id: versionId } = version;
    Logger.debug(`Loading version with alias ${alias} to cache`);
    await inMemoryCache.set(`${commandVersionCachePrefix}:${alias.toLowerCase()}`, version.toObject());
    await inMemoryCache.set(`${commandVersionCachePrefix}:${versionId}`, version.toObject());
}

export async function loadAllPrefixCommandVersionsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommandVersions = await PrefixCommandVersion.find();
    for (const version of PrefixCommandVersions) {
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandVersionToCache(version);
    }
}

export async function refreshSinglePrefixCommandVersionCache(oldVersion: IPrefixCommandVersion, newVersion: IPrefixCommandVersion) {
    await clearSinglePrefixCommandVersionCache(oldVersion);
    await loadSinglePrefixCommandVersionToCache(newVersion);
}

export async function refreshAllPrefixCommandVersionsCache() {
    await clearAllPrefixCommandVersionsCache();
    await loadAllPrefixCommandVersionsToCache();
}

/**
 * Prefix Command Category Cache Management Functions
 */

export async function clearSinglePrefixCommandCategoryCache(category: IPrefixCommandCategory) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { name } = category;
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

export async function loadSinglePrefixCommandCategoryToCache(category: IPrefixCommandCategory) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { name } = category;
    Logger.debug(`Loading category ${name} to cache`);
    await inMemoryCache.set(`PF_CATEGORY:${name.toLowerCase()}`, category.toObject());
}

export async function loadAllPrefixCommandCategoriesToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommandCategories = await PrefixCommandCategory.find();
    for (const category of PrefixCommandCategories) {
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandCategoryToCache(category);
    }
}

export async function refreshSinglePrefixCommandCategoryCache(oldCategory: IPrefixCommandCategory, newCategory: IPrefixCommandCategory) {
    await clearSinglePrefixCommandCategoryCache(oldCategory);
    await loadSinglePrefixCommandCategoryToCache(newCategory);
}

export async function refreshAllPrefixCommandCategoriesCache() {
    await clearAllPrefixCommandCategoriesCache();
    await loadAllPrefixCommandCategoriesToCache();
}

/**
 * Prefix Command Channel Default Version Cache Management Functions
 */

export async function clearSinglePrefixCommandChannelDefaultVersionCache(channelDefaultVersion: IPrefixCommandChannelDefaultVersion) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { channelId } = channelDefaultVersion;
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

export async function loadSinglePrefixCommandChannelDefaultVersionToCache(channelDefaultVersion: IPrefixCommandChannelDefaultVersion) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { channelId, versionId } = channelDefaultVersion;
    const version = await PrefixCommandVersion.findById(versionId);
    if (version) {
        Logger.debug(`Loading default version for channel ${channelId} to cache`);
        await inMemoryCache.set(`PF_CHANNEL_VERSION:${channelId}`, version.toObject());
    }
}

export async function loadAllPrefixCommandChannelDefaultVersionsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommandChannelDefaultVersions = await PrefixCommandChannelDefaultVersion.find();

    for (const defaultVersion of PrefixCommandChannelDefaultVersions) {
        // eslint-disable-next-line no-await-in-loop
        await loadSinglePrefixCommandChannelDefaultVersionToCache(defaultVersion);
    }
}

export async function refreshSinglePrefixCommandChannelDefaultVersionCache(oldChannelDefaultVersion: IPrefixCommandChannelDefaultVersion, newChannelDefaultVersion: IPrefixCommandChannelDefaultVersion) {
    await clearSinglePrefixCommandChannelDefaultVersionCache(oldChannelDefaultVersion);
    await loadSinglePrefixCommandChannelDefaultVersionToCache(newChannelDefaultVersion);
}

export async function refreshAllPrefixCommandChannelDefaultVersionsCache() {
    await clearAllPrefixCommandChannelDefaultVersionsCache();
    await loadAllPrefixCommandChannelDefaultVersionsToCache();
}
