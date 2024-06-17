import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import moment from 'moment';
import { constantsConfig, Logger, makeEmbed } from '../../../../lib';

const notTimedOutEmbed = (discordUser: User) => makeEmbed({
    title: 'Remove Timeout - Failed',
    description: `${discordUser.toString()} is not currently timed out.`,
    color: Colors.Red,
});

const failedRemoveTimeoutEmbed = (discordUser: User) => makeEmbed({
    title: 'Remove Timeout - Failed',
    description: `Failed to remove timeout for ${discordUser.toString()}`,
    color: Colors.Red,
});

const modLogEmbed = (moderator: User, discordUser: User, date: string) => makeEmbed({
    author: {
        name: `[TIMEOUT REMOVED]  ${discordUser.tag}`,
        iconURL: discordUser.displayAvatarURL(),
    },
    fields: [
        {
            inline: true,
            name: 'Moderator',
            value: moderator.toString(),
        },
        {
            inline: true,
            name: 'User',
            value: discordUser.toString(),
        },
        {
            inline: false,
            name: 'Date',
            value: date,
        },
    ],
    footer: { text: `User ID: ${discordUser.id}` },
    color: Colors.Green,
});

const timeoutRemovedEmbed = (discordUser: User) => makeEmbed({
    title: `${discordUser.tag} was successfully removed from timeout`,
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Remove Timeout - No Mod Log',
    description: 'The user was removed from timeout, but no mod log was sent. Please check the channel still exists',
    color: Colors.Red,
});

export async function handleRemoveTimeoutInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const userID = interaction.options.getUser('tag_or_id')!.id;
    const discordUser = await interaction.guild.members.fetch(userID);
    const moderator = interaction.user;
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    const currentDate = new Date();
    const formattedDate: string = moment(currentDate).utcOffset(0).format();

    // Check if the user is currently timed out
    if (!discordUser.isCommunicationDisabled()) {
        await interaction.followUp({ embeds: [notTimedOutEmbed(discordUser.user)], ephemeral: true });
        return;
    }

    // Remove the timeout for the user
    try {
        await discordUser.timeout(1); // Set the duration to 0 to remove the timeout
    } catch (error) {
        Logger.error(error);
        await interaction.followUp({ embeds: [failedRemoveTimeoutEmbed(discordUser.user)], ephemeral: true });
        return;
    }

    try {
        await modLogsChannel.send({ embeds: [modLogEmbed(moderator, discordUser.user, formattedDate)] });
    } catch {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    await interaction.followUp({ embeds: [timeoutRemovedEmbed(discordUser.user)], ephemeral: true });
}
