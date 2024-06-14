import { Job } from '@hokify/agenda';
import { Colors, Guild, TextChannel, ThreadChannel } from 'discord.js';
import { Logger, getScheduler, constantsConfig, getConn, Birthday, makeEmbed, imageBaseUrl } from '../index';
import { client } from '../../client';

const gifs: string[] = [
    `${imageBaseUrl}/birthday/bubbles.gif`,
    `${imageBaseUrl}/birthday/carrey.gif`,
    `${imageBaseUrl}/birthday/cat.gif`,
    `${imageBaseUrl}/birthday/cat_2.gif`,
    `${imageBaseUrl}/birthday/cat_3.gif`,
    `${imageBaseUrl}/birthday/dance.gif`,
    `${imageBaseUrl}/birthday/dog.gif`,
    `${imageBaseUrl}/birthday/dog_2.gif`,
    `${imageBaseUrl}/birthday/dwight.gif`,
    `${imageBaseUrl}/birthday/elf.gif`,
    `${imageBaseUrl}/birthday/snoop.gif`,
    `${imageBaseUrl}/birthday/yoda.gif`,
];

export async function postBirthdays(job: Job) {
    const scheduler = getScheduler();
    if (!scheduler) {
        Logger.error('Failed to get scheduler instance');
        return;
    }

    const matchingJobs = await scheduler.jobs({ _id: job.attrs._id });
    if (matchingJobs.length !== 1) {
        Logger.debug('Job has been deleted already, skipping execution.');
        return;
    }

    const guild = client.guilds.resolve(constantsConfig.guildId);
    if (!guild) {
        Logger.error('BirthdayHandler - Guild not found.');
        return;
    }

    const channel = guild.channels.resolve(constantsConfig.channels.TEAM) as TextChannel | null;
    if (!channel) {
        Logger.error('BirthdayHandler - Channel not found.');
        return;
    }

    // Get all threads (archived included)

    await channel.threads.fetch({ archived: {} });
    const thread = channel.threads.cache.find((t) => t.id === constantsConfig.threads.BIRTHDAY_THREAD);
    if (!thread) {
        Logger.error('Birthday handler - Thread not found');
        return;
    }

    // Unarchive thread if needed

    if (thread.archived) {
        await thread.setArchived(false);
    }

    // Get DB Connection

    const conn = getConn();
    if (!conn) {
        Logger.error('BirthdayHandler - DB Connection not found, skipping processing.');
        return;
    }

    // Get current date
    const currentDate = new Date();

    // Get all birthdays for today
    const birthdays = await Birthday.find({ utcDatetime: { $lt: currentDate } });

    // If there are no birthdays, return
    if (!birthdays.length) {
        Logger.info('BirthdayHandler - No birthdays found.');
        return;
    }
    Logger.info(`BirthdayHandler - Processing ${birthdays.length} birthdays.`);

    // Send birthday messages

    for (const birthday of birthdays) {
        let user;
        try {
            user = await guild.members.fetch(birthday.userID);
        } catch (error) {
            Logger.error('BirthdayHandler - Failed to fetch user', error);
        }

        if (!user) {
            continue;
        }

        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        // Happy birthday!
        const birthdayEmbed = makeEmbed({
            title: 'Happy Birthday!',
            description: `${user.displayName}'s birthday is today!`,
            color: Colors.Green,
            image: { url: gif },
        });

        // Update birthday to next year
        const nextBirthdayDatetime = new Date(
            Date.UTC(currentDate.getUTCFullYear() + 1, birthday.month! - 1, birthday.day),
        );
        nextBirthdayDatetime.setUTCHours(10 - birthday.timezone!);
        birthday.utcDatetime = nextBirthdayDatetime;
        try {
            birthday.save();
        } catch (e) {
            Logger.error(`Birthday handler - Failed to save the new birthday trigger: ${e}`);
        }

        // Send the birthday message
        try {
            thread.send({
                content: user.toString(),
                embeds: [birthdayEmbed],
            });
        } catch (error) {
            Logger.error('BirthdayHandler - Failed to send birthday message', error);
        }
    }
}
