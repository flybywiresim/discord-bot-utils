import { ApplicationCommandOptionType, ApplicationCommandType, TextChannel } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure } from '../../lib';

const data = slashCommandStructure({
    name: 'count',
    description: 'Counts for me.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, // Overrides needed for bot dev team
    options: [
        {
            name: 'number',
            description: 'The number to count as.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
});

export default slashCommand(data, async ({ interaction }) => {
// check if user has the role
    const hasRole = interaction.member.roles.cache.has(constantsConfig.roles.BOT_DEVELOPER);

    if (!hasRole) {
        await interaction.reply({ content: 'Go count yourself ;)', ephemeral: true });
        return;
    }

    const countThread = interaction.guild.channels.resolve(constantsConfig.threads.COUNT_THREAD) as TextChannel | null;

    if (!countThread) {
        await interaction.reply({ content: 'Count thread not found.', ephemeral: true });
        return;
    }

    const countNumber = interaction.options.getInteger('number');

    await countThread.send(`${interaction.user} says ${countNumber}`);

    await interaction.reply({ content: 'Counted!', ephemeral: true });
});
