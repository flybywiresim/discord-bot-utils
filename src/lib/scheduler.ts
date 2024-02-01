import { Agenda } from '@hokify/agenda';
import { Logger, autoDisableSlowMode, sendHeartbeat } from './index';

let scheduler: Agenda;

export async function setupScheduler(name: string, url: string, callback = Logger.error) {
    try {
        scheduler = new Agenda({
            name,
            processEvery: '30 seconds',
            defaultLockLifetime: 30000, // In milliseconds, this makes sure that if the bot restarts with locked jobs, they get released quickly and tried again.
            db: {
                address: url,
                collection: `${name}Jobs`,
            },
        });
        await scheduler.start();
        scheduler.define('autoDisableSlowMode', autoDisableSlowMode);
        scheduler.define('sendHeartbeat', sendHeartbeat);
        Logger.info('Scheduler set up');
    } catch (err) {
        callback(err);
    }

    scheduler.on('error', (err) => {
        callback(err);
    });
}

export function getScheduler(callback = Logger.error) {
    if (!scheduler) {
        callback(new Error('No scheduler available. Check database connection.'));
        return null;
    }
    return scheduler;
}
