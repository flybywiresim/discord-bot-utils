import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedField, TextChannel } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
  name: 'cache-update',
  description: 'Updates the cache of the bot for a specific cache type.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin, moderator and bot developer roles
  dm_permission: false,
  options: [
    {
      name: 'bans',
      description: 'Updates the bans cache by fetching all bans.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'channels',
      description: 'Updates the channels cache by fetching all channels.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'members',
      description: 'Updates the members cache by fetching all members.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'roles',
      description: 'Updates the roles cache by fetching all roles.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
});

const cacheUpdateEmbed = (action: string, fields: any, color: number) =>
  makeEmbed({
    title: `Cache Update - ${action}`,
    fields,
    color,
  });

const noChannelEmbed = (action: string, channelName: string) =>
  makeEmbed({
    title: `Sticky Message - ${action} - No ${channelName} channel`,
    description: `The command was successful, but no message to ${channelName} was sent. Please check the channel still exists.`,
    color: Colors.Yellow,
  });

const cacheUpdateEmbedField = (
  moderator: string,
  cacheType: string,
  cacheSize: string,
  duration: string,
): EmbedField[] => [
  {
    name: 'Type',
    value: cacheType,
    inline: true,
  },
  {
    name: 'Count',
    value: cacheSize,
    inline: true,
  },
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
  let cacheSize: number | undefined;
  const start = new Date().getTime();
  const { bans, channels, members, roles } = interaction.guild;

  if (interaction.options.getSubcommand() === 'bans') {
    await bans.fetch();
    cacheSize = bans.cache.size;
  }
  if (interaction.options.getSubcommand() === 'channels') {
    await channels.fetch();
    cacheSize = channels.cache.size;
  }
  if (interaction.options.getSubcommand() === 'members') {
    await members.fetch();
    cacheSize = members.cache.size;
  }
  if (interaction.options.getSubcommand() === 'roles') {
    await roles.fetch();
    cacheSize = roles.cache.size;
  }

  const duration = ((new Date().getTime() - start) / 1000).toFixed(2);

  if (cacheSize !== undefined) {
    await interaction.editReply({
      embeds: [
        cacheUpdateEmbed(
          interaction.options.getSubcommand(),
          cacheUpdateEmbedField(
            interaction.user.tag,
            interaction.options.getSubcommand(),
            cacheSize.toString(),
            duration,
          ),
          Colors.Green,
        ),
      ],
    });

    try {
      await modLogsChannel.send({
        embeds: [
          cacheUpdateEmbed(
            interaction.options.getSubcommand(),
            cacheUpdateEmbedField(
              interaction.user.tag,
              interaction.options.getSubcommand(),
              cacheSize.toString(),
              duration,
            ),
            Colors.Green,
          ),
        ],
      });
    } catch (error) {
      await interaction.followUp({ embeds: [noChannelEmbed(interaction.options.getSubcommand(), 'mod-log')] });
    }
  }
});
