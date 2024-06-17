import { codeBlock, Colors, DMChannel, TextChannel } from 'discord.js';
import mongoose from 'mongoose';
import { constantsConfig, makeEmbed, makeLines, event, Events, getConn, Infraction, Logger, imageBaseUrl } from '../../lib';

const excludedRoles = [
    constantsConfig.roles.ADMIN_TEAM,
    constantsConfig.roles.MODERATION_TEAM,
    constantsConfig.roles.DEVELOPMENT_TEAM,
    constantsConfig.roles.MEDIA_TEAM,
    constantsConfig.roles.COMMUNITY_SUPPORT,
    constantsConfig.roles.FBW_EMERITUS,
];

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

export default event(Events.MessageCreate, async ({ log }, msg) => {
    if (msg.guild === null) {
        // DM's
        return;
    }

    const scamReportLogs = msg.guild.channels.resolve(constantsConfig.channels.SCAM_REPORT_LOGS) as TextChannel | null;
    if (scamReportLogs && msg.content.toLowerCase().includes('@everyone') && !msg.author.bot) {
        const conn = getConn();
        if (!conn && scamReportLogs) {
            await scamReportLogs.send({ embeds: [noConnEmbed] });
            return;
        }

        const MAX_MESSAGE_LENGTH = 1024;

        let messageContent = msg.content.toString();

        let messageContentFieldTitle = 'Message Content:';

        if (messageContent.length > MAX_MESSAGE_LENGTH) {
            messageContent = `${msg.content.slice(0, MAX_MESSAGE_LENGTH - 11)}...`;
            messageContentFieldTitle = 'Message Content (truncated):';
        }

        if (!(msg.channel instanceof DMChannel)) {
            let hasRole = false;
            try {
                excludedRoles.forEach((roleList) => {
                    // @ts-ignore
                    if (msg.member.roles.cache.some((role) => role.id === roleList)) {
                        hasRole = true;
                    }
                });
            } catch (e) {
                log(e);
            }
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

                await scamReportLogs.send({ embeds: [allowedEmbed] });
                return;
            }
            // Doesn't have role, message deleted, log sent, user timed out
            try {
                await msg.delete();
            } catch (e) {
                log(e);
                await scamReportLogs.send({ embeds: [deleteFailed] });
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
                await msg.member.timeout(60 * 60 * 24 * 7 * 1000, 'Scam log');
            } catch (e) {
                log(e);
                const errorEmbed = makeEmbed({
                    title: 'Error timing out user',
                    description: makeLines([
                        `An error occurred while timing out ${msg.author}`,
                        `${codeBlock(`Error : ${e}`)}`,
                    ]),
                    color: Colors.Red,
                });
                await scamReportLogs.send({ embeds: [errorEmbed] });
            }
            // Try and send a DM
            try {
                await msg.author.send('We have detected use of @everyone in one of our text channels. This function is in place to prevent discord scams and has resulted in an automatic timeout and notification of our moderation team. If this was done in error, our moderation team will reverse the timeout, however please refrain from using the @everyone ping in future.');
            } catch (e) {
                log(e);

                const noDMEmbed = makeEmbed({
                    author: {
                        name: msg.author.tag,
                        iconURL: msg.author.displayAvatarURL(),
                    },
                    description: `DM was not sent to ${msg.author.id}.`,
                });

                await scamReportLogs.send({ embeds: [noDMEmbed] });
            }

            await scamReportLogs.send({ embeds: [notAllowedEmbed] });

            // Add infraction to database

            Logger.info('Starting Infraction process');

            const newInfraction = {
                infractionType: 'ScamLog',
                moderatorID: msg.client.user.id,
                reason: `Message content: ${msg.content.toString()}`,
                date: new Date(),
                infractionID: new mongoose.Types.ObjectId(),
            };

            let userData = await Infraction.findOne({ UserID: msg.author.id });

            log(userData);

            if (!userData) {
                userData = new Infraction({
                    userID: msg.author.id,
                    infractions: [newInfraction],
                });
                Logger.info(userData);
                Logger.info('New user data created');
            } else {
                userData.infractions.push(newInfraction);
                Logger.info('User data updated');
            }

            try {
                await userData.save();
                Logger.info('Infraction process complete');
            } catch (error) {
                await scamReportLogs.send({ embeds: [logFailed] });
                Logger.error(error);
            }
        }
    }
});
