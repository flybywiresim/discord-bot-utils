import { ApplicationCommandOptionType, ApplicationCommandType, TextChannel, Colors } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed, constantsConfig, Logger } from '../../lib';

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

export default slashCommand(data, async ({ interaction }) => {
    const amount = interaction.options.getInteger('amount');

    if (!amount) {
        return interaction.reply({ content: 'Please specify the number of messages to delete.', ephemeral: true });
    }

    const { channel, user } = interaction;
    if (!channel) {
        return interaction.reply({ content: 'The channel could not be resolved.', ephemeral: true });
    }

    try {
        const messages = await (channel as TextChannel).bulkDelete(amount, true);

        const replyEmbed = makeEmbed({
            title: 'Messages Deleted',
            description: `Successfully deleted **${messages.size}** messages.`,
            color: Colors.Green,
            footer: { text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() },
            timestamp: new Date(),
        });

        const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

        const modLogEmbed = makeEmbed({
            title: '🧹 Messages Cleared',
            description: 'Messages have been cleared.',
            color: Colors.Red,
            fields: [
                { name: 'Moderator', value: `<@${user.id}>`, inline: true },
                { name: 'Channel', value: `<#${channel.id}>`, inline: true },
                { name: 'Amount', value: `${amount}`, inline: true },
            ],
            footer: { text: `Moderator ID: ${user.id}`, iconURL: user.displayAvatarURL() },
            timestamp: new Date(),
        });

        try {
            await modLogsChannel.send({ embeds: [modLogEmbed] });
        } catch (e) {
            Logger.error('An error occurred while trying to send the mod log:', e);
        }

        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });

        setTimeout(async () => {
            try {
                await interaction.deleteReply();
            } catch (error) {
                Logger.error('Failed to delete the reply message:', error);
                await interaction.followUp({ content: 'Failed to delete the reply message.', ephemeral: true });
            }
        }, 5000);

        return Promise.resolve();
    } catch (error) {
        Logger.error('Error deleting messages:', error);
        return interaction.reply({ content: 'There was an error trying to delete messages in this channel.', ephemeral: true });
    }
});
