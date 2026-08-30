import { ApplicationCommandType, MessageFlags } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
    name: 'honeypot',
    description: 'Posts the honeypot warning in the current channel.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator
    dm_permission: false,
});

const honeypotEmbed = () => {
    return makeEmbed({
        title: 'No Fly Zone - Do not Post',
        description: 'Do not post in this channel! Any message sent here will result in a softban.',
    });
};

export default slashCommand(data, async ({ interaction }) => {
    if (interaction.channel) {
        await interaction.channel.send({ embeds: [honeypotEmbed()] });
    } else {
        await interaction.reply({
            content: 'This command can only be used in a server.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    await interaction.reply({ content: 'Honeypot warning sent.', flags: MessageFlags.Ephemeral });
});
