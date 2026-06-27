import { Job } from '@hokify/agenda';
import { Logger, getScheduler } from '../index';

export async function sendHeartbeat(job: Job) {
    const scheduler = getScheduler();
    if (!scheduler) {
        Logger.error('Failed to get scheduler instance');
        return;
    }

    // Needed because of https://github.com/agenda/agenda/issues/401

    const matchingJobs = await scheduler.jobs({ _id: job.attrs._id });
    if (matchingJobs.length !== 1) {
        Logger.debug('Job has been deleted already, skipping execution.');
        return;
    }

    const heartbeatUrl = process.env.HEARTBEAT_URL;
    if (!heartbeatUrl) {
        Logger.error('HEARTBEAT_URL environment variable not set');
        return;
    }
    try {
        const heartBeatResult = await fetch(`${heartbeatUrl}`);
        if (heartBeatResult.status !== 200) {
            Logger.error('Failed to send heartbeat:', heartBeatResult.statusText);
        }
    } catch (error) {
        Logger.error('Failed to send heartbeat:', error);
    }
    Logger.info('Heartbeat sent successfully');
}
