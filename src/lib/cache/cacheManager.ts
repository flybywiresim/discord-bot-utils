import { Cache, caching } from 'cache-manager';
import { getConn, IPrefixCommand, IPrefixCommandCategory, IPrefixCommandChannelDefaultVersion, IPrefixCommandVersion, Logger, PrefixCommand, PrefixCommandCategory, PrefixCommandChannelDefaultVersion, PrefixCommandVersion } from '../index';

let inMemoryCache: Cache;
const cacheSize = 10000;
const cacheRefreshInterval = process.env.CACHE_REFRESH_INTERVAL ? Number(process.env.CACHE_REFRESH_INTERVAL) : 1800;
const cacheTTL = cacheRefreshInterval * 2 * 1000;

/**
 * Cache Prefixes
 */

export enum MemoryCachePrefix {
    COMMAND = 'PF_COMMAND',
    VERSION = 'PF_VERSION',
    CATEGORY = 'PF_CATEGORY',
    CHANNEL_DEFAULT_VERSION = 'PF_CHANNEL_VERSION',
}

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
    await Promise.all(aliases.map((alias) => inMemoryCache.del(`${MemoryCachePrefix.COMMAND}:${alias.toLowerCase()}`)));
    await inMemoryCache.del(`${MemoryCachePrefix.COMMAND}:${name.toLowerCase()}`);
}

export async function loadSinglePrefixCommandToCache(command: IPrefixCommand) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { name, aliases } = command;
    Logger.debug(`Loading command ${name} to cache`);
    await inMemoryCache.set(`${MemoryCachePrefix.COMMAND}:${name.toLowerCase()}`, command.toObject());
    await Promise.all(aliases.map((alias) => inMemoryCache.set(`${MemoryCachePrefix.COMMAND}:${alias.toLowerCase()}`, command.toObject())));
}

export async function loadAllPrefixCommandsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const prefixCommands = await PrefixCommand.find();
    await Promise.all(prefixCommands.map((command) => loadSinglePrefixCommandToCache(command)));
}

export async function refreshSinglePrefixCommandCache(oldCommand: IPrefixCommand, newCommand: IPrefixCommand) {
    await clearSinglePrefixCommandCache(oldCommand);
    await loadSinglePrefixCommandToCache(newCommand);
}

export async function refreshAllPrefixCommandsCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    // Step 1: Get all commands from the database
    const prefixCommands = await PrefixCommand.find();
    // Step 2: Get all commands from the cache
    const cacheKeys = await inMemoryCache.store.keys();
    // Step 3: Loop over cached commands
    for (const key of cacheKeys) {
        if (key.startsWith(`${MemoryCachePrefix.COMMAND}:`)) {
            const checkCommand = key.split(':')[1];
            // Step 3.a: Check if cached command exists in the database list
            let found = false;
            for (const dbCommand of prefixCommands) {
                const { name: dbCommandName, aliases: dbCommandAliases } = dbCommand;
                if (dbCommandName.toLowerCase() === checkCommand.toLowerCase() || dbCommandAliases.includes(checkCommand)) {
                    found = true;
                    break;
                }
            }
            // Step 3.b: If not found, remove from cache
            if (!found) {
                Logger.debug(`Removing command or alias ${checkCommand} from cache`);
                // eslint-disable-next-line no-await-in-loop
                await inMemoryCache.del(key);
            }
        }
    }
    // Step 4: Loop over database commands and update cache
    await Promise.all(prefixCommands.map((dbCommand) => loadSinglePrefixCommandToCache(dbCommand)));
}

/**
 * Prefix Command Version Cache Management Functions
 */

export async function clearSinglePrefixCommandVersionCache(version: IPrefixCommandVersion) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { alias, _id: versionId } = version;
    Logger.debug(`Clearing cache for command version alias "${alias}"`);
    await inMemoryCache.del(`${MemoryCachePrefix.VERSION}:${alias.toLowerCase()}`);
    await inMemoryCache.del(`${MemoryCachePrefix.VERSION}:${versionId}`);
}

export async function loadSinglePrefixCommandVersionToCache(version: IPrefixCommandVersion) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { alias, _id: versionId } = version;
    Logger.debug(`Loading version with alias ${alias} to cache`);
    await inMemoryCache.set(`${MemoryCachePrefix.VERSION}:${alias.toLowerCase()}`, version.toObject());
    await inMemoryCache.set(`${MemoryCachePrefix.VERSION}:${versionId}`, version.toObject());
}

export async function loadAllPrefixCommandVersionsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const prefixCommandVersions = await PrefixCommandVersion.find();
    await Promise.all(prefixCommandVersions.map((version) => loadSinglePrefixCommandVersionToCache(version)));
}

export async function refreshSinglePrefixCommandVersionCache(oldVersion: IPrefixCommandVersion, newVersion: IPrefixCommandVersion) {
    await clearSinglePrefixCommandVersionCache(oldVersion);
    await loadSinglePrefixCommandVersionToCache(newVersion);
}

export async function refreshAllPrefixCommandVersionsCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    // Step 1: Get all versions from the database
    const prefixCommandVersions = await PrefixCommandVersion.find();
    // Step 2: Get all versions from the cache
    const cacheKeys = await inMemoryCache.store.keys();
    // Step 3: Loop over cached versions
    for (const key of cacheKeys) {
        if (key.startsWith(`${MemoryCachePrefix.VERSION}:`)) {
            const checkVersion = key.split(':')[1];
            // Step 3.a: Check if cached version exists in the database list
            let found = false;
            for (const dbVersion of prefixCommandVersions) {
                const { _id: dbVersionId, alias } = dbVersion;
                if (dbVersionId.toString().toLowerCase() === checkVersion.toLowerCase() || alias.toLowerCase() === checkVersion.toLowerCase()) {
                    found = true;
                    break;
                }
            }
            // Step 3.b: If not found, remove from cache
            if (!found) {
                Logger.debug(`Removing version with id ${checkVersion} from cache`);
                // eslint-disable-next-line no-await-in-loop
                await inMemoryCache.del(key);
            }
        }
    }
    // Step 4: Loop over database versions and update cache
    await Promise.all(prefixCommandVersions.map((dbVersion) => loadSinglePrefixCommandVersionToCache(dbVersion)));
}

/**
 * Prefix Command Category Cache Management Functions
 */

export async function clearSinglePrefixCommandCategoryCache(category: IPrefixCommandCategory) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { name } = category;
    Logger.debug(`Clearing cache for command category "${name}"`);
    await inMemoryCache.del(`${MemoryCachePrefix.CATEGORY}:${name.toLowerCase()}`);
}

export async function loadSinglePrefixCommandCategoryToCache(category: IPrefixCommandCategory) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { name } = category;
    Logger.debug(`Loading category ${name} to cache`);
    await inMemoryCache.set(`${MemoryCachePrefix.CATEGORY}:${name.toLowerCase()}`, category.toObject());
}

export async function loadAllPrefixCommandCategoriesToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const prefixCommandCategories = await PrefixCommandCategory.find();
    await Promise.all(prefixCommandCategories.map((category) => loadSinglePrefixCommandCategoryToCache(category)));
}

export async function refreshSinglePrefixCommandCategoryCache(oldCategory: IPrefixCommandCategory, newCategory: IPrefixCommandCategory) {
    await clearSinglePrefixCommandCategoryCache(oldCategory);
    await loadSinglePrefixCommandCategoryToCache(newCategory);
}

export async function refreshAllPrefixCommandCategoriesCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    // Step 1: Get all catagories from the database
    const prefixCommandCategories = await PrefixCommandCategory.find();
    // Step 2: Get all categories from the cache
    const cacheKeys = await inMemoryCache.store.keys();
    // Step 3: Loop over cached categories
    for (const key of cacheKeys) {
        if (key.startsWith(`${MemoryCachePrefix.CATEGORY}:`)) {
            const categoryName = key.split(':')[1];
            // Step 3.a: Check if cached category exists in the database list
            let found = false;
            for (const dbCategory of prefixCommandCategories) {
                const { name: dbCategoryName } = dbCategory;
                if (dbCategoryName.toLowerCase() === categoryName.toLowerCase()) {
                    found = true;
                    break;
                }
            }
            // Step 3.b: If not found, remove from cache
            if (!found) {
                Logger.debug(`Removing category ${categoryName} from cache`);
                // eslint-disable-next-line no-await-in-loop
                await inMemoryCache.del(key);
            }
        }
    }
    // Step 4: Loop over database categories and update cache
    await Promise.all(prefixCommandCategories.map((dbCategory) => loadSinglePrefixCommandCategoryToCache(dbCategory)));
}

/**
 * Prefix Command Channel Default Version Cache Management Functions
 */

export async function clearSinglePrefixCommandChannelDefaultVersionCache(channelDefaultVersion: IPrefixCommandChannelDefaultVersion) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { channelId } = channelDefaultVersion;
    Logger.debug(`Clearing cache for channel default version for channel "${channelId}"`);
    await inMemoryCache.del(`${MemoryCachePrefix.CHANNEL_DEFAULT_VERSION}:${channelId}`);
}

export async function loadSinglePrefixCommandChannelDefaultVersionToCache(channelDefaultVersion: IPrefixCommandChannelDefaultVersion) {
    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) return;

    const { channelId, versionId } = channelDefaultVersion;
    const version = await PrefixCommandVersion.findById(versionId);
    if (version) {
        Logger.debug(`Loading default version for channel ${channelId} to cache`);
        await inMemoryCache.set(`${MemoryCachePrefix.CHANNEL_DEFAULT_VERSION}:${channelId}`, version.toObject());
    }
}

export async function loadAllPrefixCommandChannelDefaultVersionsToCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    const PrefixCommandChannelDefaultVersions = await PrefixCommandChannelDefaultVersion.find();
    await Promise.all(PrefixCommandChannelDefaultVersions.map((channelDefaultVersion) => loadSinglePrefixCommandChannelDefaultVersionToCache(channelDefaultVersion)));
}

export async function refreshAllPrefixCommandChannelDefaultVersionsCache() {
    const conn = getConn();
    const inMemoryCache = getInMemoryCache();
    if (!conn || !inMemoryCache) return;

    // Step 1: Get all channel default versions from the database
    const prefixCommandChannelDefaultVersions = await PrefixCommandChannelDefaultVersion.find();
    // Step 2: Get all channel default versions from the cache
    const cacheKeys = await inMemoryCache.store.keys();
    // Step 3: Loop over cached channel default versions
    for (const key of cacheKeys) {
        if (key.startsWith(`${MemoryCachePrefix.CHANNEL_DEFAULT_VERSION}:`)) {
            const channelId = key.split(':')[1];
            // Step 3.a: Check if cached channel default version exists in the database list
            let found = false;
            for (const dbChannelDefaultVersion of prefixCommandChannelDefaultVersions) {
                const { channelId: dbChannelId } = dbChannelDefaultVersion;
                if (dbChannelId.toString().toLowerCase() === channelId.toLowerCase()) {
                    found = true;
                    break;
                }
            }
            // Step 3.b: If not found, remove from cache
            if (!found) {
                Logger.debug(`Removing channel default version for channel ${channelId} from cache`);
                // eslint-disable-next-line no-await-in-loop
                await inMemoryCache.del(key);
            }
        }
    }
    // Step 4: Loop over database channel default versions and update cache
    await Promise.all(prefixCommandChannelDefaultVersions.map((dbChannelDefaultVersion) => loadSinglePrefixCommandChannelDefaultVersionToCache(dbChannelDefaultVersion)));
}
