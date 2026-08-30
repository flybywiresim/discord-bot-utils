import { ChatInputCommandInteraction, Colors, MessageFlags, User } from 'discord.js';
import { getConn, makeEmbed, warnUser } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Warn - No Connection',
    description: 'Could not connect to the database',
    color: Colors.Red,
});

const warnFailed = (discordUser: User) =>
    makeEmbed({
        title: 'Warn - Failed',
        description: `Failed to warn ${discordUser.toString()}, doc not saved to mongoDB`,
        color: Colors.Red,
    });

const noDM = (discordUser: User) =>
    makeEmbed({
        title: 'Warn - DM not sent',
        description: `DM was not sent to ${discordUser.toString()}, they either have DMs closed or share no mutual servers with the bot.`,
        color: Colors.Red,
    });

const warnEmbed = (discordUser: User) =>
    makeEmbed({
        title: `${discordUser.tag} was warned successfully`,
        color: Colors.Green,
    });

const noModLogs = makeEmbed({
    title: 'Warn - No Mod Log',
    description: 'The user was warned, but no mod log was sent. Please check the channel still exists',
    color: Colors.Red,
});

export async function handleWarnInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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

    const result = await warnUser({ guild: interaction.guild, user: discordUser, moderator, reason });
    if (!result.success) {
        await interaction.editReply({ embeds: [warnFailed(discordUser)] });
        return;
    }

    await interaction.editReply({ embeds: [warnEmbed(discordUser)] });
    if (result.dmSent === false) {
        await interaction.followUp({ embeds: [noDM(discordUser)], flags: MessageFlags.Ephemeral });
    }
    if (!result.modLogSent) {
        await interaction.followUp({ embeds: [noModLogs], flags: MessageFlags.Ephemeral });
    }
}
