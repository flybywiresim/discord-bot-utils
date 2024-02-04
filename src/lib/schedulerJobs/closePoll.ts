import { Job } from '@hokify/agenda';
import { Poll, getScheduler, Logger } from '..';

export async function closePoll(job: Job) {
    const scheduler = getScheduler();
    if (!scheduler) {
        Logger.error('Failed to get scheduler instance');
        return;
    }

    // Needed because of https://github.com/agenda/agenda/issues/401
    // eslint-disable-next-line no-underscore-dangle
    const matchingJobs = await scheduler.jobs({ _id: job.attrs._id });
    if (matchingJobs.length !== 1) {
        Logger.debug('Job has been deleted already, skipping execution.');
        return;
    }

    const pollID = job.attrs.data as { pollID: any };

    try {
        const poll = await Poll.findOne({ _id: pollID });

        if (!poll) {
            Logger.error(`Poll not found for ID: ${pollID}`);
            return;
        }

        if (poll.isOpen) {
            poll.isOpen = false;
            await poll.save();
            Logger.info(`Poll ${pollID} closed automatically.`);
        }
    } catch (error) {
        Logger.error(`Scheduler Close Poll: ${error}`);
    }
}
