import { Client, Colors, Guild, TextChannel } from 'discord.js';
import { constantsConfig, Birthday, getConn, Logger, makeEmbed } from './index';

const gifs: string[] = [
    'https://c.tenor.com/rngI-iARtUsAAAAC/happy-birthday.gif',
    'https://c.tenor.com/VMC8fNKdQrcAAAAd/happy-birthday-bon-anniversaire.gif',
    'https://c.tenor.com/ZVG_H1ebQ88AAAAC/hbd-happy.gif',
    'https://c.tenor.com/xRSLl2b1NtkAAAAd/happy-birthday-wish.gif',
    'https://c.tenor.com/2v8fJf67VTkAAAAC/holiday-classics-elf.gif',
    'https://c.tenor.com/WcaloX5M08oAAAAC/kingsqueedgybot-meme.gif',
    'https://c.tenor.com/UwRRdD3mCQ0AAAAC/love-sis.gif',
    'https://c.tenor.com/5_VwBuyzBaAAAAAd/scream-happy-birthday.gif',
    'https://c.tenor.com/PZckaksfSQIAAAAC/lets-party.gif',
    'https://c.tenor.com/7fg9ogkiEmgAAAAC/happy-birthday-celebrating.gif',
    'https://c.tenor.com/dfL34nBDOrcAAAAC/happy-birthday.gif',
    'https://c.tenor.com/BiEt0CS2YLUAAAAd/happy-birthday-birthday.gif',
];

export async function processBirthdays(client: Client) {
    const guild = client.guilds.resolve(constantsConfig.guildId) as Guild | null;
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
        const user = guild.members.resolve(birthday.userID!);
        // If the user is not found, we can't mention them
        if (!user) {
            continue;
        }

        // Happy birthday!
        const birthdayEmbed = makeEmbed({
            title: 'Happy Birthday!',
            description: `${user.displayName}'s birthday is today!`,
            color: Colors.Green,
            image: { url: gifs[Math.floor(Math.random() * gifs.length)] },
        });

        //Update birthday to next year
        const nextBirthdayDatetime = new Date(Date.UTC(currentDate.getUTCFullYear() + 1, birthday.month! - 1, birthday.day!));
        nextBirthdayDatetime.setUTCHours(10 - birthday.timezone!);
        birthday.utcDatetime = nextBirthdayDatetime;
        try {
            birthday.save();
        } catch (e) {
            Logger.error(`Birthday handler - Failed to save the new birthday trigger: ${e}`);
        }

        // Send the birthday message
        thread.send({ content: user.toString(), embeds: [birthdayEmbed] });
    }
}
