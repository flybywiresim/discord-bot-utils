import { ChatInputCommandInteraction } from 'discord.js';
import mongoose from 'mongoose';
import { Logger, makeEmbed, makeLines, Poll } from '../../../../lib';

export async function previewPoll(interaction: ChatInputCommandInteraction<'cached'>) {
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

        const moderator = await interaction.client.users.fetch(poll.moderatorID!);

        const optionsDescription = poll.options
            .map((opt) => `Option ${opt.number}: ${opt.value}`)
            .concat(poll.abstainAllowed ? 'Abstain: Allows you to abstain from voting' : [])
            .join('\n');

        const previewEmbed = makeEmbed({
            author: {
                name: `${moderator.tag}`,
                iconURL: moderator.displayAvatarURL(),
            },
            title: `Previewing Poll: ${poll.title}`,
            description: makeLines([
                `${poll.description}`,
                '',
                '**Options:**',
                optionsDescription,
            ]),
            fields: [
                {
                    name: 'Will end in:',
                    value: 'This displays when the poll will end',
                },
                {
                    name: 'Total votes:',
                    value: 'This displays the number of votes',
                },
            ],
            // eslint-disable-next-line no-underscore-dangle
            footer: { text: `Poll ID: ${poll._id}` },
        });

        await interaction.reply({ embeds: [previewEmbed], ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({
            content: 'Could not preview the poll, the error has been logged. Please contact the bot team.',
            ephemeral: true,
        });
    }
}
