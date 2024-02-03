import { ChatInputCommandInteraction } from 'discord.js';
import mongoose from 'mongoose';
import moment from 'moment/moment';
import { Logger, makeEmbed, makeLines, Poll } from '../../../../lib';

export async function openPoll(interaction: ChatInputCommandInteraction<'cached'>) {
    const pollID = interaction.options.getString('poll_id', true);

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

        // Check if the poll is already open
        if (poll.isOpen) {
            await interaction.reply({ content: 'The poll is already open.', ephemeral: true });
            return;
        }

        // Update the poll's isOpen property to true
        poll.isOpen = true;
        await poll.save();

        // Reply with a message indicating that the poll has been opened
        await interaction.reply({ content: `Poll "${poll.title}" has been opened.`, ephemeral: true });

        // Calculate the closing time, considering poll duration (in minutes)
        let closingTime = null;
        let formattedClosingTime = null;
        if (poll.duration !== undefined && poll.duration !== null && poll.duration !== -1) {
            closingTime = new Date(Date.now() + poll.duration);
            formattedClosingTime = moment(closingTime).utcOffset(0).format();
        }

        const moderator = await interaction.client.users.fetch(poll.moderatorID!);

        // Recreate the poll embed with additional information
        const pollEmbed = makeEmbed({
            author: {
                name: `${moderator.tag}`,
                iconURL: moderator.displayAvatarURL(),
            },
            title: `Poll: ${poll.title}`,
            description: makeLines([
                `${poll.description}`,
                '',
                'Options:',
                ...poll.options.map((opt) => `Option ${opt.number}: ${opt.value}`),
            ]),
            fields: [
                {
                    name: 'Will end in:',
                    value: formattedClosingTime || 'Infinite', // Display 'Infinite' if no closing time
                },
                {
                    name: 'Total votes:',
                    value: '0', // Initial value, you can update this dynamically as votes come in
                },
            ],
        });

        // Send the recreated poll embed
        await interaction.followUp({ embeds: [pollEmbed], ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({
            content: 'Could not open the poll, the error has been logged. Please contact the bot team.',
            ephemeral: true,
        });
    }
}
