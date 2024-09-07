import { Job } from '@hokify/agenda';
import { Logger, getInMemoryCache, getScheduler, refreshAllPrefixCommandCategoriesCache, refreshAllPrefixCommandChannelDefaultVersionsCache, refreshAllPrefixCommandVersionsCache, refreshAllPrefixCommandsCache } from '../index';

export async function refreshInMemoryCache(job: Job) {
    const scheduler = getScheduler();
    if (!scheduler) {
        Logger.error('Failed to get scheduler instance');
        return;
    }

    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) {
        Logger.error('Failed to get in-memory cache instance');
        return;
    }

    // Needed because of https://github.com/agenda/agenda/issues/401
    // eslint-disable-next-line no-underscore-dangle
    const matchingJobs = await scheduler.jobs({ _id: job.attrs._id });
    if (matchingJobs.length !== 1) {
        Logger.debug('Job has been deleted already, skipping execution.');
        return;
    }

    const start = new Date().getTime();
    try {
        await refreshAllPrefixCommandsCache();
        await refreshAllPrefixCommandVersionsCache();
        await refreshAllPrefixCommandCategoriesCache();
        await refreshAllPrefixCommandChannelDefaultVersionsCache();
    } catch (error) {
        Logger.error('Failed to refresh the in memory cache:', error);
    }
    const duration = ((new Date().getTime() - start) / 1000).toFixed(2);
    Logger.info(`In memory cache refreshed successfully, duration: ${duration}s`);
}
