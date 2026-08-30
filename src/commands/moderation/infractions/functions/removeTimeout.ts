import { ChatInputCommandInteraction, Colors, MessageFlags, User } from 'discord.js';
import { makeEmbed, removeTimeout } from '../../../../lib';

const notTimedOutEmbed = (discordUser: User) =>
    makeEmbed({
        title: 'Remove Timeout - Failed',
        description: `${discordUser.toString()} is not currently timed out.`,
        color: Colors.Red,
    });

const failedRemoveTimeoutEmbed = (discordUser: User) =>
    makeEmbed({
        title: 'Remove Timeout - Failed',
        description: `Failed to remove timeout for ${discordUser.toString()}`,
        color: Colors.Red,
    });

const timeoutRemovedEmbed = (discordUser: User) =>
    makeEmbed({
        title: `${discordUser.tag} was successfully removed from timeout`,
        color: Colors.Green,
    });

const noModLogs = makeEmbed({
    title: 'Remove Timeout - No Mod Log',
    description: 'The user was removed from timeout, but no mod log was sent. Please check the channel still exists',
    color: Colors.Red,
});

export async function handleRemoveTimeoutInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userID = interaction.options.getUser('tag_or_id')!.id;
    const discordUser = await interaction.guild.members.fetch(userID);
    const moderator = interaction.user;

    // Check if the user is currently timed out
    if (!discordUser.isCommunicationDisabled()) {
        await interaction.followUp({ embeds: [notTimedOutEmbed(discordUser.user)], flags: MessageFlags.Ephemeral });
        return;
    }

    // Remove the timeout for the user and send the mod log
    const result = await removeTimeout({ guild: interaction.guild, user: discordUser.user, moderator });
    if (!result.success) {
        await interaction.followUp({
            embeds: [failedRemoveTimeoutEmbed(discordUser.user)],
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (!result.modLogSent) {
        await interaction.followUp({ embeds: [noModLogs], flags: MessageFlags.Ephemeral });
    }

    await interaction.followUp({ embeds: [timeoutRemovedEmbed(discordUser.user)], flags: MessageFlags.Ephemeral });
}
