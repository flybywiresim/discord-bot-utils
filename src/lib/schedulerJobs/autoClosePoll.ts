import { Job } from '@hokify/agenda';
import { Poll, getScheduler, Logger } from '..';

export async function autoClosePoll(job: Job) {
    const scheduler = getScheduler();
    if (!scheduler) {
        Logger.error('Failed to get scheduler instance');
        return;
    }
}
