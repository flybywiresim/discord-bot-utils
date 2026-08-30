import { codeBlock, Colors, Message, TextChannel } from 'discord.js';
import { addInfraction, constantsConfig, makeEmbed, makeLines, getConn, imageBaseUrl, Logger } from '../../lib';

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

/**
 * Called by messageCreateHandler for every message containing @everyone.
 */
export async function handleScamLogs(msg: Message) {
    if (!msg.inGuild()) {
        return;
    }

    const scamReportLogs = msg.guild.channels.resolve(constantsConfig.channels.SCAM_REPORT_LOGS) as TextChannel | null;
    if (!scamReportLogs) {
        Logger.warn(`Scam Logs - Channel ${constantsConfig.channels.SCAM_REPORT_LOGS} not found`);
    }

    const conn = getConn();
    if (!conn) {
        await scamReportLogs?.send({ embeds: [noConnEmbed] });
        return;
    }

    const MAX_MESSAGE_LENGTH = 1024;

    let messageContent = msg.content.toString();

    let messageContentFieldTitle = 'Message Content:';

    if (messageContent.length > MAX_MESSAGE_LENGTH) {
        messageContent = `${msg.content.slice(0, MAX_MESSAGE_LENGTH - 11)}...`;
        messageContentFieldTitle = 'Message Content (truncated):';
    }

    const hasRole = msg.member?.roles.cache.hasAny(...constantsConfig.roleGroups.SUPPORT) ?? false;
    // Has role, message can stay, log sent
    if (hasRole) {
        const allowedEmbed = makeEmbed({
            title: 'Potential Scam Alert',
            thumbnail: { url: `${imageBaseUrl}/moderation/approved.png` },
            description: 'An allowed role has used @everyone',
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

        await scamReportLogs?.send({ embeds: [allowedEmbed] });
        return;
    }
    // Doesn't have role, message deleted, log sent, user timed out
    try {
        await msg.delete();
    } catch (e) {
        Logger.error(`Scam Logs - Failed to delete message ${msg.id}: ${e}`);
        await scamReportLogs?.send({ embeds: [deleteFailed] });
    }

    const notAllowedEmbed = makeEmbed({
        title: 'Potential Scam Alert',
        thumbnail: { url: `${imageBaseUrl}/moderation/scam.png` },
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
    // Time out
    try {
        // @ts-ignore
        await msg.member.timeout(60 * 60 * 24 * 1 * 1000, 'Scam log');
    } catch (e) {
        Logger.error(`Scam Logs - Failed to time out ${msg.author.tag} (${msg.author.id}): ${e}`);
        const errorEmbed = makeEmbed({
            title: 'Error timing out user',
            description: makeLines([
                `An error occurred while timing out ${msg.author}`,
                `${codeBlock(`Error : ${e}`)}`,
            ]),
            color: Colors.Red,
        });
        await scamReportLogs?.send({ embeds: [errorEmbed] });
    }
    // Try and send a DM
    try {
        await msg.author.send(
            'We have detected use of @everyone in one of our text channels. This function is in place to prevent discord scams and has resulted in an automatic timeout and notification of our moderation team. If this was done in error, our moderation team will reverse the timeout, however please refrain from using the @everyone ping in future.',
        );
    } catch (e) {
        Logger.warn(`Scam Logs - DM not sent to ${msg.author.tag} (${msg.author.id}): ${e}`);

        const noDMEmbed = makeEmbed({
            author: {
                name: msg.author.tag,
                iconURL: msg.author.displayAvatarURL(),
            },
            description: `DM was not sent to ${msg.author.id}.`,
        });

        await scamReportLogs?.send({ embeds: [noDMEmbed] });
    }

    await scamReportLogs?.send({ embeds: [notAllowedEmbed] });

    // Add infraction to database
    const infraction = await addInfraction({
        userID: msg.author.id,
        infractionType: 'ScamLog',
        moderatorID: msg.client.user.id,
        reason: 'Automatic timeout: @everyone scam detection',
    });
    if (!infraction.saved) {
        await scamReportLogs?.send({ embeds: [logFailed] });
    }
}
