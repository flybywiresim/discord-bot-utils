import { ApplicationCommandOptionType, ApplicationCommandType, TextChannel, Colors } from 'discord.js';
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

        const replyEmbed = makeEmbed({
            title: 'Messages Deleted',
            description: `Successfully deleted **${messages.size}** messages.`,
            color: Colors.Green,
            footer: { text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() },
            timestamp: new Date(),
        });

        const targetChannel = await client.channels.fetch(constantsConfig.channels.MOD_LOGS);

        if (targetChannel && (targetChannel instanceof TextChannel)) {
            const authorEmbed = makeEmbed({
                title: '🧹 Messages Cleared',
                description: 'Messages have been cleared in the server.',
                color: Colors.Red,
                fields: [
                    { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true },
                    { name: 'Amount', value: `${amount}`, inline: true },
                ],
                footer: { text: `Moderator ID: ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() },
                timestamp: new Date(),
            });
            await targetChannel.send({ embeds: [authorEmbed] });
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
