import { ChatInputCommandInteraction, Colors, MessageFlags, User } from 'discord.js';
import { makeEmbed, makeLines, timeoutUser } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Timeout - No Connection',
    description: 'Could not connect to the database. I will still try to timeout the user',
    color: Colors.Red,
});

const failedTimeoutEmbed = (discordUser: User, error: any) =>
    makeEmbed({
        title: 'Timeout - Failed',
        description: makeLines([`Failed to timeout ${discordUser.toString()}`, '', error]),
        color: Colors.Red,
    });

const timeoutEmbed = (discordUser: User) =>
    makeEmbed({
        title: `${discordUser.tag} was timed out successfully`,
        color: Colors.Green,
    });

const DMFailed = (discordUser: User) =>
    makeEmbed({
        title: 'Timeout - DM not sent',
        description: `DM was not sent to ${discordUser.toString()}, they either have DMs closed or share no mutual servers with the bot.`,
        color: Colors.Red,
    });

const noModLogs = makeEmbed({
    title: 'Timeout - No Mod Log',
    description: 'The user was timed out, but no mod log was sent. Please check the channel still exists',
    color: Colors.Red,
});

const logFailed = makeEmbed({
    title: 'Timeout - Failed to log',
    description: 'Failed to log the timeout to the database.',
    color: Colors.Red,
});

export async function handleTimeoutInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const discordUser = interaction.options.getUser('tag_or_id')!;
    const timeoutDuration = interaction.options.getNumber('duration')!;
    const timeoutReason = interaction.options.getString('reason')!;
    const moderator = interaction.user;

    //Timeout the user, send the DM and the mod log and log to the DB
    const result = await timeoutUser({
        guild: interaction.guild,
        user: discordUser,
        moderator,
        reason: timeoutReason,
        durationSeconds: timeoutDuration / 1000,
    });

    if (!result.success) {
        await interaction.editReply({ embeds: [failedTimeoutEmbed(discordUser, result.error)] });
        return;
    }

    //Timeout was successful
    await interaction.editReply({ embeds: [timeoutEmbed(discordUser)] });
    if (result.dmSent === false) {
        await interaction.followUp({ embeds: [DMFailed(discordUser)], flags: MessageFlags.Ephemeral });
    }
    if (result.modLogSent === false) {
        await interaction.followUp({ embeds: [noModLogs], flags: MessageFlags.Ephemeral });
    }
    if (result.infraction && !result.infraction.saved) {
        await interaction.followUp({
            embeds: [result.infraction.reason === 'no-connection' ? noConnEmbed : logFailed],
            flags: MessageFlags.Ephemeral,
        });
    }
}
