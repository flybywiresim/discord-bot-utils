import { ChatInputCommandInteraction } from 'discord.js';
import mongoose from 'mongoose';
import { Logger, Poll } from '../../../../lib';

export async function deleteOption(interaction: ChatInputCommandInteraction<'cached'>) {
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

        await interaction.reply({ content: `Option ${optionNumberToDelete} deleted successfully. Remaining options renumbered.`, ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({
            content: 'Could not delete poll option, the error has been logged. Please contact the bot team.',
            ephemeral: true,
        });
    }
}
