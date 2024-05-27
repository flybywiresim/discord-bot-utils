import { event, Events } from '../../lib';
import { handleRollAssignment } from './functions/handleRollAssignment';

export default event(Events.InteractionCreate, async ({ log }, interaction) => {
    if (!interaction.isButton()) return;

    log('Button Handler: Button pressed');

    const { customId, component, user } = interaction;

    const buttonLabel = component?.label;

    try {
        const [prefix, ...params] = interaction.customId.split('_');

        switch (prefix) {
        case 'roleAssignment':
            const [roleID] = params;
            await handleRollAssignment(interaction, roleID);
            log(`Button Handler: Role assignment button pressed by ${user.tag} (${user.id})`);
            log(`roleID ${roleID}`);
            break;
        default:
            if (buttonLabel) {
                log(`Button Handler: Custom ID not matched. Skipping...\nCustom ID: ${customId}, Label: ${buttonLabel}, User: ${user.tag}, User ID: ${user.id}`);
            } else {
                log(`Button Handler: Custom ID not matched. Skipping...\nCustom ID: ${customId}, Label: null, User: ${user.tag}, User ID: ${user.id}`);
            }
            return;
        }
    } catch (error) {
        log('Button Handler: Error handling button press', error);
    }
});
