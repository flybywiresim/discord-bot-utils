import { ApplicationCommandOptionType, ApplicationCommandType, TextChannel, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed, constantsConfig, Logger } from '../../lib';

const data = slashCommandStructure({
    name: 'clear-messages',
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
    const confirmButton = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Primary);

    const cancelButton = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

    const amount = interaction.options.getInteger('amount');

    if (!amount) {
        return interaction.reply({ content: 'Please specify the number of messages to clear.', ephemeral: true });
    }

    const { channel, user } = interaction;
    if (!channel) {
        return interaction.reply({ content: 'The channel could not be resolved.', ephemeral: true });
    }

    const response = await interaction.reply({ content: `Do you really want to delete ${amount} messages?`, components: [buttonRow], ephemeral: true });
    const filter = (buttonInteraction: Interaction) => buttonInteraction.user.id === interaction.user.id;

    try {
        const confirmation = await response.awaitMessageComponent({ filter, time: 120_000 });
        if (confirmation.customId === 'confirm') {
            try {
                const messages = await (channel as TextChannel).bulkDelete(amount, true);
                const replyEmbed = makeEmbed({
                    title: 'Messages Cleared',
                    description: `Successfully cleared **${messages.size}** messages.`,
                    color: Colors.Green,
                    timestamp: new Date(),
                });

                const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
                const modLogEmbed = makeEmbed({
                    title: '🧹 Messages Cleared',
                    description: 'Messages have been cleared.',
                    color: Colors.Green,
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
                setTimeout(async () => {
                    try {
                        return interaction.deleteReply();
                    } catch (error) {
                        Logger.error('Failed to delete the reply message:', error);
                        return interaction.followUp({ content: 'Failed to delete the reply message.', ephemeral: true });
                    }
                }, 5000);
                return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
            } catch (error) {
                Logger.error('Error clearing messages:', error);
                return interaction.followUp({ content: 'There was an error trying to clear messages in this channel.', ephemeral: true });
            }
        } else {
            return interaction.followUp({ content: 'Interaction was canceled.', ephemeral: true });
        }
    } catch (e) {
        return interaction.editReply({ content: '' });
    }
});
