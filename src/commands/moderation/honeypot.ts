import { ApplicationCommandType, MessageFlags } from 'discord.js';
import { constantsConfig, Logger, slashCommand, slashCommandStructure, makeEmbed, makeLines } from '../../lib';

const data = slashCommandStructure({
    name: 'honeypot',
    description: 'Posts the honeypot warning in the current channel.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator
    dm_permission: false,
});

const honeypotEmbed = () => {
    return makeEmbed({
        description: makeLines([
            '## No Fly Zone',
            'Do not post in this channel! Any message sent here will result in a softban.',
        ]),
    });
};

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.channel) {
        await interaction.followUp({
            content: 'This command can only be used in a server.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    try {
        await interaction.channel.send({ embeds: [honeypotEmbed()] });
    } catch (error) {
        Logger.error(`Honeypot - Failed to post the warning in channel ${interaction.channel.id}: ${error}`);
        await interaction.followUp({
            content: 'Failed to post the honeypot warning, check the bot permissions in this channel.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    await interaction.followUp({ content: 'Honeypot warning sent.', flags: MessageFlags.Ephemeral });
});
