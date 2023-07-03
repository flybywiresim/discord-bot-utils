import { ApplicationCommandType } from 'discord.js';
import { constantsConfig, contextMenuCommand, contextMenuCommandStructure } from '../../../lib';
import { handleListInfraction } from '../../moderation/infractions/functions/listInfractions';

const data = contextMenuCommandStructure({
    name: 'List Infractions',
    type: ApplicationCommandType.User,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, // Overrides need to be added for admin and moderator roles
    dm_permission: false,
});

export default contextMenuCommand(data, async ({ interaction }) => {
    const userID = interaction.targetId;

    await handleListInfraction(interaction, userID, true);
});
