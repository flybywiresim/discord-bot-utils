import { ChatInputCommandInteraction } from 'discord.js';
import { makeEmbed, Poll } from '../../../../lib';

export async function listPoll(interaction: ChatInputCommandInteraction<'cached'>) {
    const polls = await Poll.find({});

    const fields = polls.map((poll) => ({
        name: `${poll.title} - Status: ${poll.isOpen ? 'Open' : 'Closed'}`,
        // eslint-disable-next-line no-underscore-dangle
        value: `ID: ${poll._id}`,
    }));

    const listEmbed = makeEmbed({
        title: 'Polls',
        description: fields.length > 0 ? undefined : 'No polls set',
        fields,
    });

    await interaction.reply({ embeds: [listEmbed] });
}
