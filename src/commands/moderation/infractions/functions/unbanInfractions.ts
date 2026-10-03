import { ChatInputCommandInteraction, Colors, MessageFlags } from 'discord.js';
import { makeEmbed, unbanUser } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Unban - No Connection',
    description: 'Could not connect to the database. I will still try to unban the user',
    color: Colors.Red,
});

const failedUnbanEmbed = (userID: string) =>
    makeEmbed({
        title: 'Unban - Failed',
        description: `Failed to Unban ${userID}, this user may not be banned.`,
        color: Colors.Red,
    });

const unbanEmbed = (userID: string) =>
    makeEmbed({
        title: `${userID} was unbanned successfully`,
        color: Colors.Green,
    });

const noModLogs = makeEmbed({
    title: 'Unban - No Mod Log',
    description:
        "I can't find the mod logs channel. I will still try to unban the user. Please check the channel still exists.",
    color: Colors.Red,
});

const logFailed = makeEmbed({
    title: 'Unban - Failed to log',
    description: 'Failed to log the unban to the database.',
    color: Colors.Red,
});

export async function handleUnbanInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const discordUser = interaction.options.getUser('id')!;
    const userID = discordUser.id;
    const unbanReason = interaction.options.getString('reason')!;
    const moderator = interaction.user;

    const result = await unbanUser({ guild: interaction.guild, user: discordUser, moderator, reason: unbanReason });

    if (!result.success) {
        await interaction.followUp({ embeds: [failedUnbanEmbed(userID)], flags: MessageFlags.Ephemeral });
        return;
    }
    await interaction.followUp({ embeds: [unbanEmbed(userID)], flags: MessageFlags.Ephemeral });
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
