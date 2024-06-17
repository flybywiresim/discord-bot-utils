import { ActivityType, TextChannel } from 'discord.js';
import moment from 'moment';
import {
    constantsConfig,
    event,
    Events,
    connect,
    setupScheduler,
    Logger,
    imageBaseUrl,
    getScheduler,
} from '../lib';
import { deployCommands } from '../scripts/deployCommands';
import commandArray from '../commands';
import contextArray from '../commands/context';

export default event(Events.ClientReady, async ({ log }, client) => {
    log(`Logged in as ${client.user.username}!`);

    // Set username, activity, status and avatar
    if (process.env.NODE_ENV === 'production') {
        log('Production environment detected, setting username, activity, status and avatar.');

        try {
            client.user?.setUsername('FlyByWire Simulations Utilities');
            client.user?.setActivity('the A380X', { type: ActivityType.Watching });
            client.user?.setStatus('online');
            client.user?.setAvatar(`${imageBaseUrl}/fbw_tail.png`);
        } catch (error) {
            log('Failed to set username, activity, status and avatar:', error);
        }
    }

    // Deploy commands and contexts
    if (process.env.DEPLOY === 'true') {
        log('DEPLOY variable set to true, deploying commands and contexts.');
        try {
            await deployCommands(commandArray, contextArray)
                .then(async (user) => {
                    const bot = `<@${user.id}>`;

                    const response = process.env.NODE_ENV === 'production'
                        ? `Deployed ${commandArray.length} commands and ${contextArray.length} contexts globally as ${bot}!`
                        : `Deployed ${commandArray.length} commands and ${contextArray.length} contexts to \`<@${constantsConfig.guildId}>\` as ${bot}!`;

                    log(response);
                });
        } catch (error) {
            log('Failed to deploy commands:', error);
        }
    }

    // Connect to MongoDB and set up scheduler
    let dbConnected = false;
    let dbError: Error | undefined;
    let schedulerConnected = false;
    let schedulerError: Error | undefined;

    if (process.env.MONGODB_URL) {
        await connect(process.env.MONGODB_URL)
            .then(() => {
                dbConnected = true;
            })
            .catch((error) => {
                dbError = error;
                Logger.error(error);
            });
        await setupScheduler('fbwBotScheduler', process.env.MONGODB_URL)
            .then(() => {
                schedulerConnected = true;
            })
            .catch((error) => {
                schedulerError = error;
                Logger.error(error);
            });
    }

    // Set heartbeat handler
    if (schedulerConnected && process.env.HEARTBEAT_URL && process.env.HEARTBEAT_INTERVAL) {
        const scheduler = getScheduler();
        if (scheduler) {
            const heartbeatJobList = await scheduler.jobs({ name: 'sendHeartbeat' });
            if (heartbeatJobList.length === 0) {
                scheduler.every(`${process.env.HEARTBEAT_INTERVAL} seconds`, 'sendHeartbeat', { interval: process.env.HEARTBEAT_INTERVAL });
                Logger.info(`Heartbeat job scheduled with interval ${process.env.HEARTBEAT_INTERVAL}`);
            } else {
                const heartbeatJob = heartbeatJobList[0];
                const { interval } = heartbeatJob.attrs.data as { interval: string };
                if (interval !== process.env.HEARTBEAT_INTERVAL) {
                    await scheduler.cancel({ name: 'sendHeartbeat' });
                    scheduler.every(`${process.env.HEARTBEAT_INTERVAL} seconds`, 'sendHeartbeat', { interval: process.env.HEARTBEAT_INTERVAL });
                    Logger.info(`Heartbeat job rescheduled with new interval ${process.env.HEARTBEAT_INTERVAL}`);
                } else {
                    Logger.info('Heartbeat job already scheduled');
                }
            }
        }
    }

    // Set birthday handler
    if (schedulerConnected && process.env.BIRTHDAY_INTERVAL) {
        const scheduler = getScheduler();
        if (scheduler) {
            const birthdayJobList = await scheduler.jobs({ name: 'postBirthdays' });
            if (birthdayJobList.length === 0) {
                scheduler.every(`${process.env.BIRTHDAY_INTERVAL} seconds`, 'postBirthdays', { interval: process.env.BIRTHDAY_INTERVAL });
                Logger.info(`Birthday job scheduled with interval ${process.env.BIRTHDAY_INTERVAL}`);
            } else {
                const birthdayJob = birthdayJobList[0];
                const { interval } = birthdayJob.attrs.data as { interval: string };
                if (interval !== process.env.BIRTHDAY_INTERVAL) {
                    await scheduler.cancel({ name: 'postBirthdays' });
                    scheduler.every(`${process.env.BIRTHDAY_INTERVAL} seconds`, 'postBirthdays', { interval: process.env.BIRTHDAY_INTERVAL });
                    Logger.info(`Birthday job rescheduled with new interval ${process.env.BIRTHDAY_INTERVAL}`);
                } else {
                    Logger.info('Birthday job already scheduled');
                }
            }
        }
    }

    // Send bot status message to bot-dev channel
    const botDevChannel = client.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (botDevChannel) {
        const currentDate = new Date();
        const formattedDate = moment(currentDate)
            .utcOffset(0)
            .format();

        // Include the database connection and scheduler status in the mod logs message.
        let logMessage = `<@&${constantsConfig.roles.BOT_DEVELOPER}>\n[${formattedDate}] - ${client.user?.username} has connected! - DB State: ${dbConnected ? 'Connected' : 'Disconnected'}`;
        if (!dbConnected && dbError) {
            logMessage += ` - DB Error: ${dbError.message}`;
        }

        logMessage += ` - Scheduler State: ${schedulerConnected ? 'Connected' : 'Disconnected'}`;
        if (!schedulerConnected && schedulerError) {
            logMessage += ` - Scheduler Error: ${schedulerError.message}`;
        }

        await botDevChannel.send({ content: logMessage });
    } else {
        log('Unable to find bot-dev channel. Cannot send bot status message.');
    }
});
