import { ChatInputCommandInteraction, TextChannel, User } from 'discord.js';
import mongoose from 'mongoose';
import { constantsConfig, Logger, makeEmbed, Poll } from '../../../../lib';

const deletePollOptionModLog = (pollCreator: { tag: any; displayAvatarURL: () => any; id: any; }, commandExecutor: User, poll: any) => makeEmbed({
    author: {
        name: `${pollCreator.tag}`,
        iconURL: pollCreator.displayAvatarURL(),
    },
    title: `[OPTION DELETED] Poll: ${poll.title}`,
    fields: [
        {
            name: 'Command Executor',
            value: `${commandExecutor.tag}, ID: ${commandExecutor.id}`,
        },
        {
            name: 'Deleted Option',
            value: `${poll.options.number}`,
        },
        {
            name: 'Deleted Option Content',
            value: `${poll.options.value}`,
        },
    ],
    // eslint-disable-next-line no-underscore-dangle
    footer: { text: `Poll ID: ${poll._id}` },
});

export async function deleteOption(interaction: ChatInputCommandInteraction<'cached'>) {
    const commandExecutor = interaction.user;

    const pollID = interaction.options.getString('poll_id', true);
    const optionNumberToDelete = interaction.options.getInteger('option_number', true);

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

        if (poll.isOpen) {
            await interaction.reply({ content: 'The poll is already open. You cannot modify options of an open poll.', ephemeral: true });
            return;
        }

        // Find the index of the option to delete
        const indexToDelete = poll.options.findIndex((opt) => opt.number === optionNumberToDelete);

        if (indexToDelete === -1) {
            await interaction.reply({ content: `Option ${optionNumberToDelete} not found.`, ephemeral: true });
            return;
        }

        // Remove the option at the specified index
        poll.options.splice(indexToDelete, 1);

        // Renumber the remaining options sequentially
        poll.options.forEach((opt, index) => {
            opt.number = index + 1;
        });

        // Save the updated poll
        await poll.save();

        const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

        const pollCreator = await interaction.client.users.fetch(poll.creatorID!);

        try {
            await modLogsChannel.send({ embeds: [deletePollOptionModLog(pollCreator, commandExecutor, poll)] });
        } catch (error) {
            Logger.error(error);
            await interaction.reply({ content: `Poll option ${optionNumberToDelete} deleted, but could not send mod log, error has been logged, please notify the bot team.`, ephemeral: true });
            return;
        }

        await interaction.reply({ content: `Option ${optionNumberToDelete} deleted successfully. Remaining options renumbered.`, ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({
            content: 'Could not delete poll option, the error has been logged. Please contact the bot team.',
            ephemeral: true,
        });
    }
}
