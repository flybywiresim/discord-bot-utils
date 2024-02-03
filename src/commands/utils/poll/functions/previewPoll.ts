import { ChatInputCommandInteraction } from 'discord.js';
import mongoose from 'mongoose';
import { Logger, makeEmbed, Poll } from '../../../../lib';

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

        const fields = poll.options.map((opt) => ({
            name: `Option ${opt.number}`,
            value: opt.value?.toString() || 'No value set',
            inline: false,
        }));

        fields.push(
            {
                name: 'Will end in',
                value: 'This displays when the poll will end',
                inline: false,
            },
            {
                name: 'Number of votes',
                value: 'This displays the number of votes',
                inline: false,
            },
        );

        const previewEmbed = makeEmbed({
            author: {
                name: `${moderator.tag}`,
                iconURL: moderator.displayAvatarURL(),
            },
            title: `Previewing Poll: ${poll.title}`,
            description: `${poll.description}`,
            fields,
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
