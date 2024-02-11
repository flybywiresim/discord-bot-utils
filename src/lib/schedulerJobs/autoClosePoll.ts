import { Job } from '@hokify/agenda';
import mongoose from 'mongoose';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { constantsConfig, getScheduler, Logger, makeEmbed, makeLines, Poll } from '..';
import { client } from '../../client';

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

const closedPollModLog = (pollCreator: { tag: any; displayAvatarURL: () => any; id: any; }, poll: any, winningOptions: any[] | null, optionsDescription: string, totalVotes: { toString: () => any; }) => makeEmbed({
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
            name: 'Poll closed automatically by scheduler',
            value: '',
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

export async function autoClosePoll(job: Job) {
    const scheduler = getScheduler();
    if (!scheduler) {
        Logger.error('Failed to get scheduler instance');
        return;
    }

    // eslint-disable-next-line no-underscore-dangle
    const matchingJobs = await scheduler.jobs({ _id: job.attrs._id });
    if (matchingJobs.length !== 1) {
        Logger.debug('Job has been deleted already, skipping execution.');
        return;
    }

    const { pollID } = job.attrs.data as { pollID: string };

    const isValidObjectId = mongoose.Types.ObjectId.isValid(pollID);

    if (!isValidObjectId) {
        Logger.info('Auto Poll Close: Invalid poll ID.');
        return;
    }

    try {
        const poll = await Poll.findOne({ _id: pollID });

        if (!poll) {
            Logger.error('Auto Poll Close: Poll not found.');
            return;
        }

        if (!poll.isOpen) {
            Logger.error('Auto Poll Close: The poll is already closed.');
            return;
        }

        // Fetch the poll message
        const pollChannel = client.channels.resolve(poll.channelID!) as TextChannel;
        const pollMessage = await pollChannel?.messages.fetch(poll.messageID!);

        const totalVotes = poll.votes.length;

        const pollCreator = await client.users.fetch(poll.creatorID!);

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

        const modLogsChannel = client.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

        poll.isOpen = false;

        await poll.save();

        try {
            await modLogsChannel.send({ embeds: [closedPollModLog(pollCreator, poll, winningOptions, optionsDescription, totalVotes)] });
        } catch (error) {
            Logger.info('Auto Poll Close: Poll closed successfully, but could not send mod log, error has been logged, please notify the bot team.');
            Logger.error(error);
            return;
        }

        Logger.info(`Auto Poll CLose: Poll "${poll.title}" has been closed automatically.`);

        await job.remove();
    } catch (error) {
        Logger.error('Auto Poll Close: Error while closing poll', error);
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
