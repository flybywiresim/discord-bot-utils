import { Colors, CommandInteraction } from 'discord.js';
import moment from 'moment';
import { getConn, Infraction, makeEmbed, createPaginatedInfractionEmbedHandler } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'List - No Connection',
    description: 'Could not connect to the database',
    color: Colors.Red,
});

export async function handleListInfraction(interaction: CommandInteraction, userID: string | undefined, ephemeral = false) {
    const conn = getConn();

    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], ephemeral });
        return;
    }

    if (!userID) {
        await interaction.reply({ content: 'Please provide a user tag or ID.', ephemeral });
        return;
    }

    const id = userID;

    try {
        const discordUser = await interaction.client.users.fetch(id);

        const avatarURL = discordUser.displayAvatarURL();

        const user = await Infraction.findOne({ userID: id });
        if (!user) {
            const infractionsNotFound = makeEmbed({
                color: Colors.Red,
                author: {
                    name: `${discordUser.tag}'s Infractions not found`,
                    iconURL: avatarURL || undefined,
                },
                description: 'This user has no infractions stored in the database',
                footer: { text: `UserID: ${discordUser.id}` },
            });

            await interaction.reply({ embeds: [infractionsNotFound], ephemeral });

            return;
        }

        //Grab infractions from DB and make embeds

        const warnInfractions = user.infractions.filter((infraction) => infraction.infractionType === 'Warn');
        const timeoutInfractions = user.infractions.filter((infraction) => infraction.infractionType === 'Timeout');
        const scamLogInfractions = user.infractions.filter((infraction) => infraction.infractionType === 'ScamLog');
        const banInfractions = user.infractions.filter((infraction) => infraction.infractionType === 'Ban');
        const unbanInfractions = user.infractions.filter((infraction) => infraction.infractionType === 'Unban');
        const userNotes = user.infractions.filter((infraction) => infraction.infractionType === 'Note');

        const infractionsLengths = {
            warnsLength: warnInfractions.length.toString(),
            timeoutsLength: timeoutInfractions.length.toString(),
            scamLogsLength: scamLogInfractions.length.toString(),
            bansLength: banInfractions.length.toString(),
            unbansLength: unbanInfractions.length.toString(),
            notesLength: userNotes.length.toString(),
        };

        type InfractionArray = typeof warnInfractions
            | typeof timeoutInfractions
            | typeof scamLogInfractions
            | typeof banInfractions
            | typeof unbanInfractions
            | typeof userNotes;

        const fetchModerators = (infractions: InfractionArray) => {
            const moderatorPromises = infractions.map((infraction) => interaction.client.users.fetch(infraction.moderatorID!)
                // Disabled for readability
                // eslint-disable-next-line arrow-body-style
                .catch(() => {
                    return new Promise((resolve) => {
                        resolve(`I can't find the moderator, here is the stored ID: ${infraction.moderatorID}`);
                    });
                }));

            return Promise.all(moderatorPromises);
        };

        // Warns
        const warnFields: { name: string; value: string }[] = [];
        const warnModeratorUsers = await fetchModerators(warnInfractions);

        for (let i = 0; i < warnInfractions.length; i++) {
            const formattedDate: string = moment(warnInfractions[i].date)
                .utcOffset(0)
                .format();

            warnFields.push(
                {
                    name: `Warn #${i + 1}`,
                    value:
                        `**Type:** ${warnInfractions[i].infractionType}\n`
                        + `**Moderator:** ${warnModeratorUsers[i]}\n`
                        + `**Reason:** ${warnInfractions[i].reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${warnInfractions[i].infractionID}`,
                },
                {
                    name: '',
                    value: '----------------------------------------',
                },
            );
        }

        const warnsEmbed = makeEmbed({
            author: {
                name: `${discordUser.tag}'s Warns`,
                iconURL: avatarURL || undefined,
            },
            description: warnFields.length > 0 ? '' : 'This user has no warns logged',
            fields: warnFields.flat(),
            footer: { text: `UserID: ${user.userID}` },
        });

        //Timeouts
        const timeoutFields: { name: string; value: string }[] = [];
        const timeoutModeratorUsers = await fetchModerators(timeoutInfractions);

        for (let i = 0; i < timeoutInfractions.length; i++) {
            const formattedDate: string = moment(timeoutInfractions[i].date)
                .utcOffset(0)
                .format();

            timeoutFields.push(
                {
                    name: `Timeout #${i + 1}`,
                    value:
                        `**Type:** ${timeoutInfractions[i].infractionType}\n`
                        + `**Moderator:** ${timeoutModeratorUsers[i]}\n`
                        + `**Reason:** ${timeoutInfractions[i].reason}\n`
                        + `**Duration:** ${timeoutInfractions[i].duration !== undefined ? timeoutInfractions[i].duration : 'No duration specified, this user was timed out before the bot upgrade!'}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${timeoutInfractions[i].infractionID}`,
                },
                {
                    name: '',
                    value: '----------------------------------------',
                },
            );
        }

        const timeoutsEmbed = makeEmbed({
            author: {
                name: `${discordUser.tag}'s Timeouts`,
                iconURL: avatarURL || undefined,
            },
            description: timeoutFields.length > 0 ? '' : 'This user has no timeouts logged',
            fields: timeoutFields.flat(),
            footer: { text: `UserID: ${user.userID}` },
        });

        //ScamLogs
        const scamLogFields: { name: string; value: string }[] = [];
        const scamLogModerators = await fetchModerators(scamLogInfractions);

        for (let i = 0; i < scamLogInfractions.length; i++) {
            const formattedDate: string = moment(scamLogInfractions[i].date)
                .utcOffset(0)
                .format();

            scamLogFields.push(
                {
                    name: `Scam Log #${i + 1}`,
                    value:
                        `**Type:** ${scamLogInfractions[i].infractionType}\n`
                        + `**Moderator:** ${scamLogModerators[i]}\n`
                        + `**Message Content:** ${scamLogInfractions[i].reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${scamLogInfractions[i].infractionID}`,
                },
                {
                    name: '',
                    value: '----------------------------------------',
                },
            );
        }

        const scamLogEmbed = makeEmbed({
            author: {
                name: `${discordUser.tag}'s Scam Log Entries`,
                iconURL: avatarURL || undefined,
            },
            description: scamLogFields.length > 0 ? '' : 'This user has no scam log entries logged',
            fields: scamLogFields.flat(),
            footer: { text: `UserID: ${user.userID}` },
        });

        //Bans
        const banFields: { name: string; value: string }[] = [];
        const banModerators = await fetchModerators(banInfractions);

        for (let i = 0; i < banInfractions.length; i++) {
            const formattedDate: string = moment(banInfractions[i].date)
                .utcOffset(0)
                .format();

            banFields.push(
                {
                    name: `Ban #${i + 1}`,
                    value:
                        `**Type:** ${banInfractions[i].infractionType}\n`
                        + `**Moderator:** ${banModerators[i]}\n`
                        + `**Reason:** ${banInfractions[i].reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${banInfractions[i].infractionID}`,
                },
                {
                    name: '',
                    value: '----------------------------------------',
                },
            );
        }

        const banEmbed = makeEmbed({
            author: {
                name: `${discordUser.tag}'s Bans`,
                iconURL: avatarURL || undefined,
            },
            description: banFields.length > 0 ? '' : 'This user has no bans logged',
            fields: banFields.flat(),
            footer: { text: `UserID: ${user.userID}` },
        });

        //Unbans
        const unbanFields: { name: string; value: string }[] = [];
        const unbanModerators = await fetchModerators(unbanInfractions);
        for (let i = 0; i < unbanInfractions.length; i++) {
            const formattedDate: string = moment(unbanInfractions[i].date)
                .utcOffset(0)
                .format();

            unbanFields.push(
                {
                    name: `Unban #${i + 1}`,
                    value:
                        `**Type:** ${unbanInfractions[i].infractionType}\n`
                        + `**Moderator:** ${unbanModerators[i]}\n`
                        + `**Reason:** ${unbanInfractions[i].reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${unbanInfractions[i].infractionID}`,
                },
                {
                    name: '',
                    value: '----------------------------------------',
                },
            );
        }

        const unbanEmbed = makeEmbed({
            author: {
                name: `${discordUser.tag}'s Unbans`,
                iconURL: avatarURL || undefined,
            },
            description: unbanFields.length > 0 ? '' : 'This user has no unbans logged',
            fields: unbanFields.flat(),
            footer: { text: `UserID: ${user.userID}` },
        });

        //Notes
        const noteFields: { name: string; value: string }[] = [];
        const userNodeModerators = await fetchModerators(userNotes);

        for (let i = 0; i < userNotes.length; i++) {
            const formattedDate: string = moment(userNotes[i].date)
                .utcOffset(0)
                .format();

            noteFields.push(
                {
                    name: `Note #${i + 1}`,
                    value:
                        `**Type:** ${userNotes[i].infractionType}\n`
                        + `**Moderator:** ${userNodeModerators[i]}\n`
                        + `**Note:** ${userNotes[i].reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${userNotes[i].infractionID}`,
                },
                {
                    name: '',
                    value: '----------------------------------------',
                },
            );
        }

        const userNoteEmbed = makeEmbed({
            author: {
                name: `${discordUser.tag}'s Notes`,
                iconURL: avatarURL || undefined,
            },
            description: noteFields.length > 0 ? '' : 'This user has no notes logged',
            fields: noteFields.flat(),
            footer: { text: `UserID: ${user.userID}` },
        });

        //Make the about embed
        const aboutEmbed = makeEmbed({
            author: {
                name: `${discordUser.tag}'s Infractions`,
                iconURL: avatarURL || undefined,
            },
            description: 'Click the buttons below to view the user\'s infractions in detail.',
            fields: [
                {
                    name: 'UserID',
                    value: user.userID!,
                    inline: false,
                },
                {
                    name: 'User Tag',
                    value: `<@${user.userID!}>`,
                    inline: false,
                },
                {
                    name: 'Warns',
                    value: infractionsLengths.warnsLength,
                    inline: true,
                },
                {
                    name: 'Timeouts',
                    value: infractionsLengths.timeoutsLength,
                    inline: true,
                },
                {
                    name: 'Scam Log Entries',
                    value: infractionsLengths.scamLogsLength,
                    inline: true,
                },
                {
                    name: 'Bans',
                    value: infractionsLengths.bansLength,
                    inline: true,
                },
                {
                    name: 'Unbans',
                    value: infractionsLengths.unbansLength,
                    inline: true,
                },
                {
                    name: 'Notes',
                    value: infractionsLengths.notesLength,
                    inline: true,
                },
            ],
            footer: { text: 'The buttons will expire in two minutes from command execution.' },
        });

        //Collect embeds and send with the paginator
        const embeds = [aboutEmbed, warnsEmbed, timeoutsEmbed, scamLogEmbed, banEmbed, unbanEmbed, userNoteEmbed];
        await interaction.deferReply({ ephemeral });

        await createPaginatedInfractionEmbedHandler(interaction, interaction.user.id, embeds, infractionsLengths);
    } catch (error) {
        //Error handling - User is no longer on discord (Or ID doesn't exist)

        const userNotFound = makeEmbed({
            color: Colors.Red,
            title: 'User not found',
            description: 'An error occurred while fetching user information, please check the userID. If the ID is correct, this user may not exist on Discord anymore - If you need to view their infractions anyway one of the bot team can search the DB manually.',
        });

        await interaction.followUp({ embeds: [userNotFound], ephemeral });
    }
}
