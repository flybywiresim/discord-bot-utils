import { ChatInputCommandInteraction, Colors, Guild, TextChannel, User } from 'discord.js';
import moment from 'moment/moment';
import mongoose from 'mongoose';
import { constantsConfig, getConn, Infraction, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Warn - No Connection',
    description: 'Could not connect to the database',
    color: Colors.Red,
});

const warnFailed = (discordUser: User) => makeEmbed({
    title: 'Warn - Failed',
    description: `Failed to warn ${discordUser.toString()}, doc not saved to mongoDB`,
    color: Colors.Red,
});

const dmEmbed = (guild: Guild, formattedDate: any, moderator: User, reason: string) => makeEmbed({
    title: `You have been warned in ${guild.name}`,
    fields: [
        {
            inline: false,
            name: 'Moderator',
            value: moderator.toString(),
        },
        {
            inline: false,
            name: 'Reason',
            value: reason,
        },
        {
            inline: false,
            name: 'Date',
            value: formattedDate,
        },
    ],
});

const noDM = (discordUser: User) => makeEmbed({
    title: 'Warn - DM not sent',
    description: `DM was not sent to ${discordUser.toString()}, they either have DMs closed or share no mutual servers with the bot.`,
    color: Colors.Red,
});

const modLogEmbed = (formattedDate: any, moderator: User, discordUser: User, reason: string) => makeEmbed({
    author: {
        name: `[WARNED]  ${discordUser.tag}`,
        iconURL: discordUser.displayAvatarURL(),
    },
    fields: [
        {
            inline: false,
            name: 'User',
            value: discordUser.toString(),
        },
        {
            inline: false,
            name: 'Moderator',
            value: moderator.toString(),
        },
        {
            inline: false,
            name: 'Reason',
            value: reason,
        },
        {
            inline: false,
            name: 'Date',
            value: formattedDate,
        },
    ],
    footer: { text: `User ID: ${discordUser.id}` },
    color: Colors.Red,
});

const warnEmbed = (discordUser: User) => makeEmbed({
    title: `${discordUser.tag} was warned successfully`,
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Warn - No Mod Log',
    description: 'The user was warned, but no mod log was sent. Please check the channel still exists',
    color: Colors.Red,
});

export async function handleWarnInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();

    if (!conn) {
        await interaction.editReply({ embeds: [noConnEmbed] });
        return;
    }

    const userID = interaction.options.getUser('tag_or_id')?.id;

    if (!userID) {
        await interaction.editReply({ content: 'Please provide a user tag or ID.' });
        return;
    }

    const reason = interaction.options.getString('reason');

    if (!reason) {
        await interaction.editReply({ content: 'Please provide a reason.' });
        return;
    }

    const discordUser = await interaction.client.users.fetch(userID);

    const moderator = interaction.user;

    const currentDate = new Date();

    const formattedDate: string = moment(currentDate).utcOffset(0).format();

    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

    //Try to save to the database

    Logger.info('Starting Infraction process');

    const newInfraction = {
        infractionType: 'Warn',
        moderatorID: moderator.id,
        reason,
        date: currentDate,
        infractionID: new mongoose.Types.ObjectId(),
    };

    let userData = await Infraction.findOne({ userID });

    Logger.info(userData);

    if (!userData) {
        userData = new Infraction({
            userID,
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
        await interaction.editReply({ embeds: [warnFailed(discordUser)] });
        Logger.error(error);
        return;
    }

    await interaction.editReply({ embeds: [warnEmbed(discordUser)] });

    //Send DM to user

    try {
        await discordUser.send({ embeds: [dmEmbed(interaction.guild, formattedDate, moderator, reason)] });
    } catch {
        await interaction.followUp({ embeds: [noDM(discordUser)], ephemeral: true });
    }

    //Send embed to mod-logs channel

    try {
        await modLogsChannel.send({ embeds: [modLogEmbed(formattedDate, moderator, discordUser, reason)] });
    } catch {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }
}
