import { event, Events } from '../../lib';
import { handleRollAssignment } from './functions/handleRollAssignment';
import { handlePoll } from './functions/handlePoll';

export default event(Events.InteractionCreate, async ({ log }, interaction) => {
    if (!interaction.isButton()) return;

    log('Button Handler: Button pressed');

    const { customId, component, user } = interaction;

    const buttonLabel = component?.label;

    try {
        const [prefix, ...params] = interaction.customId.split('_');

        switch (prefix) {
        case 'poll':
            const [pollID, optionNumber] = params;
            await handlePoll(interaction, pollID, optionNumber);
            log(`Button Handler: Poll button pressed by ${user.tag} (${user.id})`);
            log(`pollID ${pollID}`);
            log(`optionNumber ${optionNumber}`);
            break;
        case 'roleAssignment':
            const [roleID] = params;
            await handleRollAssignment(interaction, roleID);
            log(`Button Handler: Role assignment button pressed by ${user.tag} (${user.id})`);
            log(`roleID ${roleID}`);
            break;
        default:
            if (buttonLabel) {
                log(`Role Assignment: Custom ID not matched. Skipping...\nCustom ID: ${customId}, Label: ${buttonLabel}, User: ${user.tag}, User ID: ${user.id}`);
            } else {
                log(`Role Assignment: Custom ID not matched. Skipping...\nCustom ID: ${customId}, Label: null, User: ${user.tag}, User ID: ${user.id}`);
            }
            return;
        }
    } catch (error) {
        log('Button Handler: Error handling button press', error);
    }
});
