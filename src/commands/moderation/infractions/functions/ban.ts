import { ChatInputCommandInteraction, Colors, MessageFlags, User } from 'discord.js';
import { banMember, makeEmbed } from '../../../../lib';

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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userID = interaction.options.getUser('tag_or_id')!.id;
    const banReason = interaction.options.getString('reason')!;
    const daysDeletedNumber = interaction.options.getInteger('days_deleted') || 0;
    const discordUser = await interaction.guild.members.fetch(userID);
    const moderator = interaction.user;

    //Check if the user is a moderator
    if (!discordUser.moderatable) {
        await interaction.followUp({ embeds: [moderatableFailEmbed], flags: MessageFlags.Ephemeral });
        return;
    }

    //DM the user, ban the user, send the mod log and log to the DB
    const result = await banMember({
        member: discordUser,
        moderator,
        reason: banReason,
        deleteMessageSeconds: daysDeletedNumber * 24 * 60 * 60,
    });

    if (result.dmSent === false) {
        await interaction.followUp({ embeds: [DMFailed(discordUser.user)], flags: MessageFlags.Ephemeral });
    }
    if (!result.success) {
        await interaction.followUp({ embeds: [failedBanEmbed(discordUser.user)], flags: MessageFlags.Ephemeral });
        return;
    }
    await interaction.followUp({ embeds: [banEmbed(discordUser.user)], flags: MessageFlags.Ephemeral });
    if (!result.modLogSent) {
        await interaction.followUp({ embeds: [noModLogs], flags: MessageFlags.Ephemeral });
    }
    if (result.infraction && !result.infraction.saved) {
        await interaction.followUp({
            embeds: [result.infraction.reason === 'no-connection' ? noConnEmbed : logFailed],
            flags: MessageFlags.Ephemeral,
        });
    }
}
