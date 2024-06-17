import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import moment from 'moment';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
  name: 'whois',
  description: 'Provides information about a user.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator roles
  dm_permission: false,
  options: [
    {
      name: 'tag_or_id',
      description: "Provide a user's tag or id to get information about them.",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
});

const beautifiedStatus: { [key: string]: string } = {
  ONLINE: 'Online',
  IDLE: 'Idle',
  DND: 'Do Not Disturb',
  OFFLINE: 'Offline',
};

export default slashCommand(data, async ({ interaction }) => {
  const targetMember = interaction.options.getMember('tag_or_id') ?? interaction.member;

  const filteredRoles = targetMember.roles.cache.filter((role) => role.id !== interaction.guild.id);
  const listedRoles = filteredRoles.sort((a, b) => b.position - a.position).map((role) => role.toString());

  const onlineStatus = beautifiedStatus[targetMember.presence?.status?.toUpperCase() ?? 'OFFLINE'];

  let status;
  if (targetMember.presence == null) {
    status = 'Offline';
  } else {
    status = onlineStatus;
  }

  const whoisEmbed = makeEmbed({
    author: {
      name: targetMember.user.username,
      iconURL: targetMember.user.avatarURL()!,
    },
    description: `${targetMember}`,
    thumbnail: { url: targetMember.user.avatarURL()! },
    fields: [
      {
        name: 'Username',
        value: targetMember.user.tag,
        inline: true,
      },
      {
        name: 'Status',
        value: status,
        inline: true,
      },
      {
        name: 'Joined',
        value: moment(targetMember.joinedTimestamp).format('llll'),
        inline: true,
      },
      {
        name: 'Registered',
        value: moment(targetMember.user.createdTimestamp).format('llll'),
        inline: false,
      },
      {
        name: 'Roles',
        value: `\u200B${listedRoles.join(', ')}`,
      },
      {
        name: 'Permissions',
        value: targetMember.permissions
          .toArray()
          .join(', ')
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/(^\w)|(\s+\w)/g, (char) => char.toUpperCase()),
      },
    ],
    footer: { text: `User ID: ${targetMember.id}` },
  });

  return interaction.reply({ embeds: [whoisEmbed] });
});
