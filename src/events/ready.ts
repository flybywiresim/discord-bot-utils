import { ActivityType, TextChannel } from 'discord.js';
import moment from 'moment';
import {
    constantsConfig,
    event,
    Events,
    connect,
    setupScheduler,
    Logger,
    processBirthdays,
    imageBaseUrl,
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

    // Connect to MongoDB
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

    // Set birthday handler

    const birthdayInterval = setInterval(processBirthdays, 1000 * 60 * 30, client);

    client.on('disconnect', () => {
        clearInterval(birthdayInterval);
    });

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
