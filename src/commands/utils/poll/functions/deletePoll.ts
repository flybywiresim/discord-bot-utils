import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import moment from 'moment';
import mongoose from 'mongoose';
import { constantsConfig, Logger, makeEmbed, Poll } from '../../../../lib';

const pollDeletedEmbed = (moderator: User, pollTitle: string, pollID: string, formattedDate: string) => makeEmbed({
    author: {
        name: `[Poll Deleted] ${moderator.tag}`,
        iconURL: moderator.displayAvatarURL(),
    },
    fields: [
        {
            inline: false,
            name: 'Poll Title',
            value: pollTitle,
        },
        {
            inline: false,
            name: 'Poll ID',
            value: pollID,
        },
    ],
    footer: { text: `Timestamp: ${formattedDate}` },
    color: Colors.Red,
});

export async function deletePoll(interaction: ChatInputCommandInteraction<'cached'>) {
    const pollID = interaction.options.getString('poll_id', true);

    const moderator = interaction.user;

    const currentDate = new Date();

    const formattedDate: string = moment(currentDate).utcOffset(0).format();

    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

    const isValidObjectId = mongoose.Types.ObjectId.isValid(pollID);

    if (!isValidObjectId) {
        await interaction.reply({ content: 'Invalid poll ID.', ephemeral: true });
        return;
    }

    try {
        const poll = await Poll.findOne({ _id: pollID });

        if (!poll) {
            await interaction.reply({ content: 'Poll not found.', ephemeral: true });
            return;
        }

        const pollTitle = poll.title || 'Could not find title.';

        try {
            await poll.deleteOne({ _id: pollID });
        } catch (error) {
            Logger.error(error);
            await interaction.reply({ content: 'Could not delete poll, error has been logged, please notify the bot team.', ephemeral: true });
            return;
        }

        try {
            await modLogsChannel.send({ embeds: [pollDeletedEmbed(moderator, pollTitle, pollID, formattedDate)] });
        } catch (error) {
            Logger.error(error);
            await interaction.reply({ content: 'Poll deleted successfully, but could not send mod log, error has been logged, please notify the bot team.', ephemeral: true });
            return;
        }

        await interaction.reply({ content: 'Poll deleted successfully.', ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({ content: 'Could not delete poll, error has been logged, please notify the bot team.', ephemeral: true });
    }
}
