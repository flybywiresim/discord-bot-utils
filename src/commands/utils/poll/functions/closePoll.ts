import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import mongoose from 'mongoose';
import { constantsConfig, Logger, makeEmbed, makeLines, Poll } from '../../../../lib';

const closedPollEmbed = (pollCreator: { tag: any; displayAvatarURL: () => any; }, poll: any, winningOptions: any[] | null, optionsDescription: string, totalVotes: { toString: () => any; }) => makeEmbed({
    author: {
        name: `${pollCreator.tag}`,
        iconURL: pollCreator.displayAvatarURL(),
    },
    title: `[CLOSED] Poll: ${poll.title}`,
    description: makeLines([
        `${poll.description}`,
        '',
        `Winning option: ${
            winningOptions !== null
                ? winningOptions.map((option) => (option === -1 ? 'Abstain' : `Option ${option}`)).join(', ')
                : 'No winner'
        }`,
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

const closedPollModLog = (pollCreator: { tag: any; displayAvatarURL: () => any; id: any; }, poll: any, winningOptions: any[] | null, optionsDescription: string, commandExecutor: { tag: any; id: any; }, totalVotes: { toString: () => any; }) => makeEmbed({
    author: {
        name: `${pollCreator.tag}`,
        iconURL: pollCreator.displayAvatarURL(),
    },
    title: `[CLOSED] Poll: ${poll.title}`,
    description: makeLines([
        `${poll.description}`,
        '',
        `Winning option: ${
            winningOptions !== null
                ? winningOptions.map((option) => (option === -1 ? 'Abstain' : `Option ${option}`)).join(', ')
                : 'No winner'
        }`,
        '',
        '**Options:**',
        optionsDescription,
    ]),
    fields: [
        {
            name: 'Poll creator:',
            value: `${pollCreator.tag}, ID: ${pollCreator.id}`,
        },
        {
            name: 'Poll closed by:',
            value: `${commandExecutor.tag}, ID: ${commandExecutor.id}`,
        },
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

export async function closePoll(interaction: ChatInputCommandInteraction<'cached'>) {
    const commandExecutor = interaction.user;

    // get the poll ID from the interaction and check if it's a valid ObjectId
    const pollID = interaction.options.getString('poll_id', true);

    const isValidObjectId = mongoose.Types.ObjectId.isValid(pollID);

    if (!isValidObjectId) {
        await interaction.reply({ content: 'Invalid poll ID.', ephemeral: true });
        return;
    }

    // Find the poll in the database
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

        // Check if a user is a moderator
        const moderatorRole = interaction.guild?.roles.cache.get(constantsConfig.roles.MODERATION_TEAM);

        //check if the user is the poll creator or has the moderator role
        if (interaction.user.id !== poll.creatorID && !interaction.member?.roles.cache.has(moderatorRole?.id!)) {
            await interaction.reply({ content: 'You do not have permission to close this poll.', ephemeral: true });
            return;
        }

        // Fetch the poll message

        const pollChannel = interaction.guild?.channels.resolve(poll.channelID!) as TextChannel;
        const pollMessage = await pollChannel?.messages.fetch(poll.messageID!);

        const totalVotes = poll.votes.length;

        const pollCreator = await interaction.client.users.fetch(poll.creatorID!);

        const optionsDescription = poll.options
            .map((opt) => `Option ${opt.number}: ${opt.value} - Votes: ${getVotesCount(opt.number, poll.votes)}`)
            .concat(poll.abstainAllowed ? `Abstain: Allows you to abstain from voting - Votes: ${getVotesCount(-1, poll.votes)}` : [])
            .join('\n');

        // Calculate the winning option

        const winningOptions = calculateWinningOption(poll);

        const emptyButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('vote_placeholder')
                .setLabel('This poll has now closed')
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary),
        );

        await pollMessage?.edit({ embeds: [closedPollEmbed(pollCreator, poll, winningOptions, optionsDescription, totalVotes)], components: [emptyButtonRow] });

        const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

        poll.isOpen = false;

        await poll.save();

        try {
            await modLogsChannel.send({ embeds: [closedPollModLog(pollCreator, poll, winningOptions, optionsDescription, commandExecutor, totalVotes)] });
        } catch (error) {
            Logger.error(error);
            await interaction.reply({ content: 'Poll closed successfully, but could not send mod log, error has been logged, please notify the bot team.', ephemeral: true });
            return;
        }

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

function calculateWinningOption(poll: any): number[] | null {
    const voteCounts: Record<number, number> = {};

    poll.votes.forEach((vote: any) => {
        if (vote.optionNumber !== undefined) {
            if (voteCounts[vote.optionNumber] === undefined) {
                voteCounts[vote.optionNumber] = 1;
            } else {
                voteCounts[vote.optionNumber]++;
            }
        }
    });

    const maxVotes = Math.max(...Object.values(voteCounts));
    const winningOptions: number[] = [];

    for (const [option, count] of Object.entries(voteCounts)) {
        if (count === maxVotes) {
            winningOptions.push(Number(option));
        }
    }

    return winningOptions.length > 0 ? winningOptions : null;
}
