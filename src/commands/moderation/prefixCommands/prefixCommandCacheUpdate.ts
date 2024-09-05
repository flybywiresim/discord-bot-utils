import { ApplicationCommandType, Colors, EmbedField, TextChannel } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed, refreshAllPrefixCommandsCache, refreshAllPrefixCommandVersionsCache } from '../../../lib';

const data = slashCommandStructure({
    name: 'prefix-commands-cache-update',
    description: 'Updates the in-memory prefix command cache of the bot.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin, moderator and bot developer roles
    dm_permission: false,
    options: [],
});

const cacheUpdateEmbed = (fields: any, color: number) => makeEmbed({
    title: 'Prefix Command Cache Update',
    fields,
    color,
});

const noChannelEmbed = (channelName: string) => makeEmbed({
    title: `Prefix Command Cache Update - No ${channelName} channel`,
    description: `The command was successful, but no message to ${channelName} was sent. Please check the channel still exists.`,
    color: Colors.Yellow,
});

const cacheUpdateEmbedField = (moderator: string, duration: string): EmbedField[] => [
    {
        name: 'Moderator',
        value: moderator,
        inline: true,
    },
    {
        name: 'Duration',
        value: `${duration}s`,
        inline: true,
    },
];

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply({ ephemeral: true });

    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    const start = new Date().getTime();

    await refreshAllPrefixCommandsCache();
    await refreshAllPrefixCommandVersionsCache();

    const duration = ((new Date().getTime() - start) / 1000).toFixed(2);

    await interaction.editReply({
        embeds: [cacheUpdateEmbed(
            cacheUpdateEmbedField(
                interaction.user.tag,
                duration,
            ),
            Colors.Green,
        )],
    });

    try {
        await modLogsChannel.send({
            embeds: [cacheUpdateEmbed(
                cacheUpdateEmbedField(
                    interaction.user.tag,
                    duration,
                ),
                Colors.Green,
            )],
        });
    } catch (error) {
        await interaction.followUp({ embeds: [noChannelEmbed('mod-log')] });
    }
});
