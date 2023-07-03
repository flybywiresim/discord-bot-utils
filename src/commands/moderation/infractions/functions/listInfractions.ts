import { Colors, CommandInteraction } from 'discord.js';
import moment from 'moment';
import { getConn, Infraction, makeEmbed, sendPaginatedInfractionEmbeds } from '../../../../lib';

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

        // Warns

        const warnFields: { name: string; value: string }[] = [];
        for (const infraction of warnInfractions) {
            const index = warnInfractions.indexOf(infraction);
            let moderatorUser;
            try {
                const moderator = await interaction.client.users.fetch(infraction.moderatorID!);
                moderatorUser = moderator.toString();
            } catch (error) {
                moderatorUser = `I can't find the moderator, here is the stored ID ${infraction.moderatorID}`;
            }

            const formattedDate: string = moment(infraction.date)
                .utcOffset(0)
                .format();

            warnFields.push(
                {
                    name: `Warn #${index + 1}`,
                    value:
                        `**Type:** ${infraction.infractionType}\n`
                        + `**Moderator:** ${moderatorUser}\n`
                        + `**Reason:** ${infraction.reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${infraction.infractionID}`,
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
        for (const infraction of timeoutInfractions) {
            const index = timeoutInfractions.indexOf(infraction);
            let moderatorUser;
            try {
                const moderator = await interaction.client.users.fetch(infraction.moderatorID!);
                moderatorUser = moderator.toString();
            } catch (error) {
                moderatorUser = `I can't find the moderator, here is the stored ID ${infraction.moderatorID}`;
            }

            const formattedDate: string = moment(infraction.date)
                .utcOffset(0)
                .format();

            timeoutFields.push(
                {
                    name: `Timeout #${index + 1}`,
                    value:
                        `**Type:** ${infraction.infractionType}\n`
                        + `**Moderator:** ${moderatorUser}\n`
                        + `**Reason:** ${infraction.reason}\n`
                        + `**Duration:** ${infraction.duration !== undefined ? infraction.duration : 'No duration specified, this user was timed out before the bot upgrade!'}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${infraction.infractionID}`,
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
        for (const infraction of scamLogInfractions) {
            const index = scamLogInfractions.indexOf(infraction);
            let moderatorUser;
            try {
                const moderator = await interaction.client.users.fetch(infraction.moderatorID!);
                moderatorUser = moderator.toString();
            } catch (error) {
                moderatorUser = `I can't find the moderator, here is the stored ID ${infraction.moderatorID}`;
            }

            const formattedDate: string = moment(infraction.date)
                .utcOffset(0)
                .format();

            scamLogFields.push(
                {
                    name: `Scam Log #${index + 1}`,
                    value:
                        `**Type:** ${infraction.infractionType}\n`
                        + `**Moderator:** ${moderatorUser}\n`
                        + `**Message Content:** ${infraction.reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${infraction.infractionID}`,
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
        for (const infraction of banInfractions) {
            const index = banInfractions.indexOf(infraction);
            let moderatorUser;
            try {
                const moderator = await interaction.client.users.fetch(infraction.moderatorID!);
                moderatorUser = moderator.toString();
            } catch (error) {
                moderatorUser = `I can't find the moderator, here is the stored ID ${infraction.moderatorID}`;
            }

            const formattedDate: string = moment(infraction.date)
                .utcOffset(0)
                .format();

            banFields.push(
                {
                    name: `Ban #${index + 1}`,
                    value:
                        `**Type:** ${infraction.infractionType}\n`
                        + `**Moderator:** ${moderatorUser}\n`
                        + `**Reason:** ${infraction.reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${infraction.infractionID}`,
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
        for (const infraction of unbanInfractions) {
            const index = unbanInfractions.indexOf(infraction);
            let moderatorUser;
            try {
                const moderator = await interaction.client.users.fetch(infraction.moderatorID!);
                moderatorUser = moderator.toString();
            } catch (error) {
                moderatorUser = `I can't find the moderator, here is the stored ID ${infraction.moderatorID}`;
            }

            const formattedDate: string = moment(infraction.date)
                .utcOffset(0)
                .format();

            unbanFields.push(
                {
                    name: `Unban #${index + 1}`,
                    value:
                        `**Type:** ${infraction.infractionType}\n`
                        + `**Moderator:** ${moderatorUser}\n`
                        + `**Reason:** ${infraction.reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${infraction.infractionID}`,
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
        for (const infraction of userNotes) {
            const index = userNotes.indexOf(infraction);
            let moderatorUser;
            try {
                const moderator = await interaction.client.users.fetch(infraction.moderatorID!);
                moderatorUser = moderator.toString();
            } catch (error) {
                moderatorUser = `I can't find the moderator, here is the stored ID ${infraction.moderatorID}`;
            }

            const formattedDate: string = moment(infraction.date)
                .utcOffset(0)
                .format();

            noteFields.push(
                {
                    name: `Note #${index + 1}`,
                    value:
                        `**Type:** ${infraction.infractionType}\n`
                        + `**Moderator:** ${moderatorUser}\n`
                        + `**Note:** ${infraction.reason}\n`
                        + `**Date:** ${formattedDate}\n`
                        + `**Infraction ID:** ${infraction.infractionID}`,
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
                    value: warnInfractions.length.toString(),
                    inline: true,
                },
                {
                    name: 'Timeouts',
                    value: timeoutInfractions.length.toString(),
                    inline: true,
                },
                {
                    name: 'Scam Log Entries',
                    value: scamLogInfractions.length.toString(),
                    inline: true,
                },
                {
                    name: 'Bans',
                    value: banInfractions.length.toString(),
                    inline: true,
                },
                {
                    name: 'Unbans',
                    value: unbanInfractions.length.toString(),
                    inline: true,
                },
                {
                    name: 'Notes',
                    value: userNotes.length.toString(),
                    inline: true,
                },
            ],
            footer: { text: 'The buttons will expire in two minutes from command execution.' },
        });

        //Collect embeds and send with the paginator

        const embeds = [aboutEmbed, warnsEmbed, timeoutsEmbed, scamLogEmbed, banEmbed, unbanEmbed, userNoteEmbed];
        await interaction.deferReply({ ephemeral });

        await sendPaginatedInfractionEmbeds(interaction, interaction.user.id, embeds);
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
