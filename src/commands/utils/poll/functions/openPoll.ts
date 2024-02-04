import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, TextChannel } from 'discord.js';
import mongoose from 'mongoose';
import moment from 'moment/moment';
import { Logger, makeEmbed, makeLines, Poll, getScheduler } from '../../../../lib';

const noSchedulerEmbed = makeEmbed({
    title: 'Poll - No scheduler',
    description: 'Could not find an active scheduler. The Poll will not be created.',
    color: Colors.Red,
});

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

        // Calculate the closing time, considering poll duration (in minutes)
        let closingTime = null;
        let formattedClosingTime = null;
        // If the poll duration is -1, the poll will be open indefinitely
        if (poll.duration !== undefined && poll.duration !== null && poll.duration !== -1) {
            closingTime = new Date(Date.now() + poll.duration);
            poll.closingTime = closingTime;
            formattedClosingTime = moment(closingTime).utcOffset(0).format();
        }

        const optionButtons = createOptionButtons(poll);

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
                '**Options:**',
                ...poll.options.map((opt) => `Option ${opt.number}: ${opt.value}`),
            ]),
            fields: [
                {
                    name: 'Will end at:',
                    value: formattedClosingTime || 'Infinite', // Display 'Infinite' if no closing time
                },
                {
                    name: 'Total votes:',
                    value: '0', // Initial value, you can update this dynamically as votes come in
                },
            ],
            // eslint-disable-next-line no-underscore-dangle
            footer: { text: `Poll ID: ${poll._id}` },
        });

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(optionButtons);

        const pollChannel = interaction.guild.channels.resolve(poll.channelID!) as TextChannel;

        if (poll.notify && poll.notify.trim() !== '') {
            await pollChannel.send({ content: poll.notify });
        }

        const scheduler = getScheduler();
        if (!scheduler) {
            await interaction.reply({ embeds: [noSchedulerEmbed] });
        }

        try {
            // eslint-disable-next-line no-underscore-dangle
            if (scheduler) await scheduler.schedule(moment(closingTime).toDate(), 'closePoll', { pollID });
        } catch (error) {
            Logger.error(error);
            await interaction.reply({
                content: 'Could not schedule the poll to close, the poll will not be created. The error has been logged, please contact the bot team.',
                ephemeral: true,
            });
            return;
        }

        // Send the recreated poll embed
        const pollMessage = await pollChannel.send({ embeds: [pollEmbed], components: [buttonRow] });

        // Update the poll's isOpen property to true
        poll.isOpen = true;
        poll.messageID = pollMessage.id;
        await poll.save();

        // Reply with a message indicating that the poll has been opened
        await interaction.reply({ content: `Poll "${poll.title}" has been opened.`, ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({
            content: 'Could not open the poll, the error has been logged. Please contact the bot team.',
            ephemeral: true,
        });
    }
}

function createOptionButtons(poll: any) {
    // eslint-disable-next-line no-underscore-dangle
    const pollID = poll._id.toString();

    return poll.options.map((option: { number: any }) => new ButtonBuilder()
        .setCustomId(`vote_${pollID}_${option.number}`)
        .setLabel(`Option ${option.number}`)
        .setStyle(ButtonStyle.Primary));
}
