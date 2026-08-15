import { ChatInputCommandInteraction, Colors, Guild, TextChannel, User } from 'discord.js';
import moment from 'moment';
import mongoose from 'mongoose';
import { constantsConfig, getConn, Infraction, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Ban - No Connection',
    description: 'Could not connect to the database. I will still try to ban the user.',
    color: Colors.Red,
});

const moderatableFailEmbed = makeEmbed({
    color: Colors.Red,
    description: "You can't ban a moderator!",
});

const failedBanEmbed = (discordUser: User) =>
    makeEmbed({
        title: 'Ban - Failed',
        description: `Failed to Ban ${discordUser.toString()}`,
        color: Colors.Red,
    });

const DMEmbed = (moderator: User, banReason: string, guild: Guild) =>
    makeEmbed({
        title: `You have been banned from ${guild.name}`,
        description: 'This ban is also logged against your record.',
        fields: [
            {
                inline: true,
                name: 'Moderator',
                value: moderator.toString(),
            },
            {
                inline: false,
                name: 'Reason',
                value: banReason,
            },
            {
                inline: false,
                name: 'Appeal',
                value: `If you would like to appeal your ban, please fill out [this form.](${process.env.BAN_APPEAL_URL})`,
            },
        ],
    });

const banEmbed = (discordUser: User) =>
    makeEmbed({
        title: `${discordUser.tag} was banned successfully`,
        color: Colors.Green,
    });

const DMFailed = (discordUser: User) =>
    makeEmbed({
        title: 'Ban - DM not sent',
        description: `DM was not sent to ${discordUser.toString()}, they either have DMs closed or share no mutual servers with the bot.`,
        color: Colors.Red,
    });

const modLogEmbed = (
    moderator: User,
    discordUser: User,
    banReason: string,
    daysDeletedNumber: number,
    formattedDate: string,
) =>
    makeEmbed({
        author: {
            name: `[BANNED] ${discordUser.tag}`,
            iconURL: discordUser.displayAvatarURL(),
        },
        fields: [
            {
                name: 'User',
                value: discordUser.toString(),
            },
            {
                name: 'Moderator',
                value: `${moderator}`,
            },
            {
                name: 'Reason',
                value: `\u200B${banReason}`,
            },
            {
                name: 'Days of messages deleted',
                value: daysDeletedNumber.toString(),
            },
            {
                name: 'Date',
                value: formattedDate,
            },
        ],
        footer: { text: `User ID: ${discordUser.id}` },
        color: Colors.Red,
    });

const noModLogs = makeEmbed({
    title: 'Ban - No Mod Log',
    description:
        "I can't find the mod logs channel. I will still try to ban the user. Please check the channel still exists.",
    color: Colors.Red,
});

const logFailed = makeEmbed({
    title: 'Ban - Failed to log',
    description: 'Failed to log the ban to the database.',
    color: Colors.Red,
});

export async function handleBanInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();

    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
    }

    const userID = interaction.options.getUser('tag_or_id')!.id;
    const banReason = interaction.options.getString('reason')!;
    const daysDeletedNumber = interaction.options.getInteger('days_deleted') || 0;

    const discordUser = await interaction.guild.members.fetch(userID);
    const moderator = interaction.user;
    const currentDate = new Date();
    const formattedDate: string = moment(currentDate).utcOffset(0).format();
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

    //Check if the user is a moderator

    if (!discordUser.moderatable) {
        await interaction.followUp({ embeds: [moderatableFailEmbed], ephemeral: true });
        return;
    }

    //Check if the mod logs channel exists

    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    //DM the user

    try {
        await discordUser.send({ embeds: [DMEmbed(moderator, banReason, interaction.guild)] });
    } catch {
        if (modLogsChannel) {
            await interaction.followUp({ embeds: [DMFailed(discordUser.user)], ephemeral: true });
        }
    }

    //Ban the user

    try {
        await interaction.guild.members.ban(discordUser, { deleteMessageDays: daysDeletedNumber, reason: banReason });
        if (modLogsChannel) {
            await modLogsChannel.send({
                embeds: [modLogEmbed(moderator, discordUser.user, banReason, daysDeletedNumber, formattedDate)],
            });
        }
        await interaction.followUp({ embeds: [banEmbed(discordUser.user)], ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.followUp({ embeds: [failedBanEmbed(discordUser.user)], ephemeral: true });
    }

    //Log to the DB
    Logger.info('Starting Infraction process');

    const newInfraction = {
        infractionType: 'Ban',
        moderatorID: moderator.id,
        reason: banReason,
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
        await interaction.followUp({ embeds: [logFailed], ephemeral: true });
        Logger.error(error);
    }
}
