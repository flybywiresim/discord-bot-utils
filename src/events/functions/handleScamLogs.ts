import { codeBlock, Colors, EmbedBuilder, Message, TextChannel } from 'discord.js';
import { addInfraction, constantsConfig, makeEmbed, makeLines, getConn, imageBaseUrl, Logger } from '../../lib';

const MAX_MESSAGE_LENGTH = 1024 - 8;

const noConnEmbed = makeEmbed({
    title: 'Scam Logs - No Connection',
    description: 'Could not connect to the database.',
    color: Colors.Red,
});

const logFailed = makeEmbed({
    title: 'Scam Logs - Failed to log',
    description: 'Failed to log the Scam Log entry to the database.',
    color: Colors.Red,
});

const deleteFailed = makeEmbed({
    title: 'Scam Logs - Failed to delete',
    description: 'Failed to delete the message.',
    color: Colors.Red,
});

const scamAlertEmbed = (msg: Message<true>, allowed: boolean) => {
    let messageContent = msg.content;
    let messageContentFieldTitle = 'Message Content:';
    if (messageContent.length > MAX_MESSAGE_LENGTH) {
        messageContent = `${msg.content.slice(0, MAX_MESSAGE_LENGTH - 3)}...`;
        messageContentFieldTitle = 'Message Content (truncated):';
    }

    return makeEmbed({
        title: 'Potential Scam Alert',
        thumbnail: { url: `${imageBaseUrl}/moderation/${allowed ? 'approved' : 'scam'}.png` },
        ...(allowed && { description: 'An allowed role has used @everyone' }),
        author: {
            name: msg.author.tag,
            iconURL: msg.author.displayAvatarURL(),
        },
        fields: [
            {
                name: 'User:',
                value: `${msg.author}`,
            },
            {
                name: 'Channel:',
                value: `${msg.channel}`,
            },
            {
                name: messageContentFieldTitle,
                value: codeBlock(messageContent),
            },
        ],
    });
};

export async function handleScamLogs(msg: Message) {
    if (!msg.inGuild()) {
        return;
    }

    const scamReportLogs = msg.guild.channels.resolve(constantsConfig.channels.SCAM_REPORT_LOGS) as TextChannel | null;
    if (!scamReportLogs) {
        Logger.warn(`Scam Logs - Channel ${constantsConfig.channels.SCAM_REPORT_LOGS} not found, nothing is reported`);
    }
    const report = async (embed: EmbedBuilder) => {
        try {
            await scamReportLogs?.send({ embeds: [embed] });
        } catch (error) {
            Logger.warn(`Scam Logs - Failed to send to channel ${constantsConfig.channels.SCAM_REPORT_LOGS}: ${error}`);
        }
    };

    const conn = getConn();
    if (!conn) {
        await report(noConnEmbed);
        return;
    }

    const hasRole = msg.member?.roles.cache.hasAny(...constantsConfig.roleGroups.SUPPORT) ?? false;
    if (hasRole) {
        await report(scamAlertEmbed(msg, true));
        return;
    }

    try {
        await msg.delete();
    } catch (e) {
        Logger.error(`Scam Logs - Failed to delete message ${msg.id}: ${e}`);
        await report(deleteFailed);
    }

    // Time out
    try {
        // @ts-ignore
        await msg.member.timeout(60 * 60 * 24 * 1 * 1000, 'Scam log');
    } catch (e) {
        Logger.error(`Scam Logs - Failed to time out ${msg.author.tag} (${msg.author.id}): ${e}`);
        await report(
            makeEmbed({
                title: 'Error timing out user',
                description: makeLines([
                    `An error occurred while timing out ${msg.author}`,
                    `${codeBlock(`Error : ${e}`)}`,
                ]),
                color: Colors.Red,
            }),
        );
    }

    // Try and send a DM
    try {
        await msg.author.send(
            'We have detected use of @everyone in one of our text channels. This function is in place to prevent discord scams and has resulted in an automatic timeout and notification of our moderation team. If this was done in error, our moderation team will reverse the timeout, however please refrain from using the @everyone ping in future.',
        );
    } catch (e) {
        Logger.warn(`Scam Logs - DM not sent to ${msg.author.tag} (${msg.author.id}): ${e}`);
        await report(
            makeEmbed({
                author: {
                    name: msg.author.tag,
                    iconURL: msg.author.displayAvatarURL(),
                },
                description: `DM was not sent to ${msg.author.id}.`,
            }),
        );
    }

    await report(scamAlertEmbed(msg, false));

    // Add infraction to database
    const infraction = await addInfraction({
        userID: msg.author.id,
        infractionType: 'ScamLog',
        moderatorID: msg.client.user.id,
        reason: 'Automatic timeout: @everyone scam detection',
    });
    if (!infraction.saved) {
        await report(logFailed);
    }
}
