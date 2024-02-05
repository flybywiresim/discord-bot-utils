import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import mongoose from 'mongoose';
import { constantsConfig, Logger, makeEmbed, makeLines, Poll } from '../../../../lib';

export async function closePoll(interaction: ChatInputCommandInteraction<'cached'>) {
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

        // Check if the poll is already closed
        if (!poll.isOpen) {
            await interaction.reply({ content: 'The poll is already closed.', ephemeral: true });
            return;
        }

        // Check if a user has a role by checking against a role ID
        const moderatorRole = interaction.guild?.roles.cache.get(constantsConfig.roles.MODERATOR);

        //check if the user is the poll creator or has the moderator role
        if (interaction.user.id !== poll.moderatorID && !interaction.member?.roles.cache.has(moderatorRole?.id!)) {
            await interaction.reply({ content: 'You do not have permission to close this poll.', ephemeral: true });
            return;
        }

        poll.isOpen = false;

        await poll.save();

        // Fetch the poll message

        const pollChannel = interaction.guild?.channels.resolve(poll.channelID!) as TextChannel;
        const pollMessage = await pollChannel?.messages.fetch(poll.messageID!);

        const totalVotes = poll.votes.length;

        const moderator = await interaction.client.users.fetch(poll.moderatorID!);

        const optionsDescription = poll.options
            .map((opt) => `Option ${opt.number}: ${opt.value} - Votes: ${getVotesCount(opt.number, poll.votes)}`)
            .concat(poll.abstainAllowed ? `Abstain: Allows you to abstain from voting - Votes: ${getVotesCount(-1, poll.votes)}` : [])
            .join('\n');

        const closedPollEmbed = makeEmbed({
            author: {
                name: `${moderator.tag}`,
                iconURL: moderator.displayAvatarURL(),
            },
            title: `[CLOSED] Poll: ${poll.title}`,
            description: makeLines([
                '**This poll has been closed.**',
                '',
                `${poll.description}`,
                '',
                '**Options:**',
                optionsDescription,
            ]),
            fields: [
                {
                    name: 'Poll closed at:',
                    value: poll.closingTime || 'Poll had an infinite duration', // Display 'Infinite' if no closing time
                },
                {
                    name: 'Total votes:',
                    value: totalVotes.toString(),
                },
            ],
            // eslint-disable-next-line no-underscore-dangle
            footer: { text: `Poll ID: ${poll._id}` },
        });

        const emptyButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('vote_placeholder').setLabel('This poll has now closed').setDisabled(true),
        );

        await pollMessage?.edit({ embeds: [closedPollEmbed], components: [emptyButtonRow] });

        await interaction.reply({ content: 'The poll has been closed.', ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({
            content: 'Could not close the poll, the error has been logged. Please contact the bot team.',
            ephemeral: true,
        });
    }
}

function getVotesCount(optionNumber: number | null | undefined, votes: { userID?: string | null | undefined; optionNumber?: number | null | undefined }[]): number {
    if (optionNumber === -1) {
        // Count votes for abstain
        return votes.filter((vote) => vote.optionNumber === -1).length;
    }
    // Count votes for a specific option
    return votes.filter((vote) => vote.optionNumber === optionNumber).length;
}
