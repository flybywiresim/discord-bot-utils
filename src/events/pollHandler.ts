import { ButtonInteraction } from 'discord.js';
import { event, Events, Logger, makeEmbed, makeLines, Poll } from '../lib';

export default event(Events.InteractionCreate, async ({ log }, interaction) => {
    if (!interaction.isButton()) return;

    log('Poll Handler: Button pressed');

    try {
        const [action, pollID, optionNumber] = interaction.customId.split('_');

        if (action === 'poll' && pollID && optionNumber) {
            await handleVote(interaction, pollID, optionNumber);
        } else {
            log('Poll Handler: Custom ID not matched, skipping...');
        }
    } catch (error) {
        log('Poll Handler: Error handling button press', error);
    }
});

async function handleVote(interaction: ButtonInteraction, pollID: string, optionNumber: string) {
    try {
        const poll = await Poll.findOne({ _id: pollID });

        if (!poll) {
            await interaction.reply({ content: 'Poll not found.', ephemeral: true });
            return;
        }

        if (!poll.isOpen) {
            await interaction.reply({ content: 'The poll is closed.', ephemeral: true });
            return;
        }

        const userAlreadyVoted = poll.votes.some((vote) => vote.userID === interaction.user.id);

        if (userAlreadyVoted) {
            await interaction.reply({ content: 'You have already voted.', ephemeral: true });
            return;
        }

        poll.votes.push({
            userID: interaction.user.id,
            optionNumber,
        });

        await poll.save();

        await interaction.reply({ content: 'Your vote has been saved.', ephemeral: true });

        // Calculate the total votes based on the length of the votes array
        const totalVotes = poll.votes.length;

        const moderator = await interaction.client.users.fetch(poll.moderatorID!);

        const optionsDescription = poll.options
            .map((opt) => `Option ${opt.number}: ${opt.value} - Votes: ${getVotesCount(opt.number, poll.votes)}`)
            .concat(poll.abstainAllowed ? `Abstain: Allows you to abstain from voting - Votes: ${getVotesCount(-1, poll.votes)}` : [])
            .join('\n');

        // Update the original embed with the new vote information
        const updatedEmbed = makeEmbed({
            author: {
                name: `${moderator.tag}`,
                iconURL: moderator.displayAvatarURL(),
            },
            title: `Poll: ${poll.title}`,
            description: makeLines([
                `${poll.description}`,
                '',
                '**Options:**',
                optionsDescription,
            ]),
            fields: [
                {
                    name: 'Will end at:',
                    value: poll.closingTime || 'Infinite', // Display 'Infinite' if no closing time
                },
                {
                    name: 'Total votes:',
                    value: totalVotes.toString(),
                },
            ],
            // eslint-disable-next-line no-underscore-dangle
            footer: { text: `Poll ID: ${poll._id}` },
        });

        await interaction.message.edit({ embeds: [updatedEmbed] });

        // Update the poll embed here
    } catch (error) {
        Logger.error('Poll Handler: Error handling vote', error);
        await interaction.reply({
            content: 'Could not process your vote. The error has been logged. Please contact the bot team.',
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
