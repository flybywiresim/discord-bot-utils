import { ApplicationCommandOptionType, ApplicationCommandType, TextChannel } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed, constantsConfig } from '../../lib';

const data = slashCommandStructure({
    name: 'clear',
    description: 'Delete a specified number of messages in the current channel.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER,
    dm_permission: false,
    options: [{
        name: 'amount',
        description: 'Number of messages to delete (1-100).',
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
        max_value: 100,
    }],
});

export default slashCommand(data, async ({ interaction, log, client }) => {
    const amount = interaction.options.getInteger('amount');

    if (!interaction.channel || !interaction.channel.isTextBased()) {
        return interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
    }

    if (amount === null) {
        return interaction.reply({ content: 'Please specify the number of messages to delete.', ephemeral: true });
    }

    try {
        const messages = await interaction.channel.bulkDelete(amount, true);
        const replyEmbed = makeEmbed({ description: `Successfully deleted ${messages.size} messages.` });

        const targetChannel = await client.channels.fetch('1237362529965965352');

        if (targetChannel && (targetChannel instanceof TextChannel)) {
            const authorEmbed = makeEmbed({
                title: 'Messages Cleared',
                description: `**Moderator:** ${interaction.member.displayName}\n**Channel:** ${interaction.channel.name}\n**Amount:** ${amount}\n`,
                timestamp: new Date(),
            });
            await (targetChannel as TextChannel).send({ embeds: [authorEmbed] });
        } else {
            log('Target channel not found or not a text channel');
        }

        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });

        setTimeout(async () => {
            try {
                await interaction.deleteReply();
            } catch (err) {
                log('Failed to delete the reply message:', err);
                await interaction.followUp({ content: 'Failed to delete the reply message.', ephemeral: true });
            }
        }, 5000);

        return Promise.resolve();
    } catch (error) {
        log('Error deleting messages:', error);
        return interaction.reply({ content: 'There was an error trying to delete messages in this channel.', ephemeral: true });
    }
});
