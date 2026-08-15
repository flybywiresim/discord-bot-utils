import { ApplicationCommandType } from 'discord.js';
import moment from 'moment/moment';
import { constantsConfig, contextMenuCommand, contextMenuCommandStructure, makeEmbed } from '../../../lib';

const data = contextMenuCommandStructure({
    name: 'User Info',
    type: ApplicationCommandType.User,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER,
    dm_permission: false,
});

const beautifiedStatus: { [key: string]: string } = {
    ONLINE: 'Online',
    IDLE: 'Idle',
    DND: 'Do Not Disturb',
    OFFLINE: 'Offline',
};

export default contextMenuCommand(data, async ({ interaction }) => {
    const targetMember = interaction.guild?.members.cache.get(interaction.targetId)!;

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
