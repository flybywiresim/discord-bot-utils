import { ApplicationCommandOptionType, ApplicationCommandType, PermissionsBitField } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const ALLOWED_ROLE_IDS = ['775838587639824455', '716718991619653692'];

const data = slashCommandStructure({
    name: 'clear',
    description: 'Delete a specified number of messages in the current channel.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
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

    if (!interaction.channel || !interaction.channel.isTextBased()) {
        return interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
    }

    if (amount === null) {
        return interaction.reply({ content: 'Please specify the number of messages to delete.', ephemeral: true });
    }

    const member = await interaction.guild?.members.fetch(interaction.user.id);
    const hasAllowedRole = member && member.roles.cache.some((role) => ALLOWED_ROLE_IDS.includes(role.id));

    if (!hasAllowedRole) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
        const messages = await interaction.channel.bulkDelete(amount, true);
        const replyEmbed = makeEmbed({ description: `Successfully deleted ${messages.size} messages.` });

        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });

        setTimeout(async () => {
            try {
                await interaction.deleteReply();
            } catch (err) {
                //
            }
        }, 5000);

        return Promise.resolve();
    } catch (error) {
        console.error('Error deleting messages:', error);
        return interaction.reply({ content: 'There was an error trying to delete messages in this channel.', ephemeral: true });
    }
});
