import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
import { constantsConfig, makeEmbed, slashCommand, slashCommandStructure } from '../../lib';

const data = slashCommandStructure({
    name: 'role-assignment',
    description: 'Configures and sends the role assignment embed.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator
    dm_permission: false,
});

const interestedInEmbed = makeEmbed({
    title: 'Role Assignment',
    description: 'Please react below to set your role according to your skill set. If you do not have the skills in any of the available roles, please do not react as this will not benefit the development of the addon.',
});

const mediaAnnouncementsEmbed = makeEmbed({
    title: 'Media Announcements',
    description: 'Please react to the corresponding buttons to be pinged for the various announcements.',
});

function splitButtonsIntoRows(buttons: ButtonBuilder[], maxButtonsPerRow: number): ButtonBuilder[][] {
    const rows: ButtonBuilder[][] = [];
    let currentRow: ButtonBuilder[] = [];

    for (const button of buttons) {
        currentRow.push(button);

        if (currentRow.length === maxButtonsPerRow) {
            rows.push([...currentRow]);
            currentRow = [];
        }
    }

    if (currentRow.length > 0) {
        rows.push([...currentRow]);
    }

    return rows;
}

export default slashCommand(data, async ({ interaction }) => {
    const maxButtonsPerRow = 5; // Define the maximum buttons per row

    const interestedInButtons: ButtonBuilder[] = [];
    const mediaAnnouncementsButtons: ButtonBuilder[] = [];

    const { roleAssignmentIds } = constantsConfig;
    roleAssignmentIds.forEach((group) => {
        group.roles.forEach((role) => {
            const button = new ButtonBuilder()
                .setCustomId(role.id)
                .setLabel(role.label)
                .setStyle(ButtonStyle.Primary);

            if (group.group === 'interestedIn') {
                interestedInButtons.push(button);
            } else if (group.group === 'mediaAnnouncements') {
                mediaAnnouncementsButtons.push(button);
            }
        });
    });

    // Split the buttons into rows
    const interestedInRows = splitButtonsIntoRows(interestedInButtons, maxButtonsPerRow);
    const mediaAnnouncementsRows = splitButtonsIntoRows(mediaAnnouncementsButtons, maxButtonsPerRow);

    if (!interaction.channel) {
        await interaction.reply({ content: 'Interaction channel is null.', ephemeral: true });
        return;
    }

    // Create a single embed for each group type and add all rows to it
    const interestedInEmbedWithRows = {
        embeds: [interestedInEmbed],
        components: [] as ActionRowBuilder<ButtonBuilder>[],
    };

    const mediaAnnouncementsEmbedWithRows = {
        embeds: [mediaAnnouncementsEmbed],
        components: [] as ActionRowBuilder<ButtonBuilder>[],
    };

    interestedInRows.forEach((row) => {
        const actionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(...row);
        interestedInEmbedWithRows.components.push(actionRow);
    });

    mediaAnnouncementsRows.forEach((row) => {
        const actionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(...row);
        mediaAnnouncementsEmbedWithRows.components.push(actionRow);
    });

    // Send the embeds with attached rows
    await interaction.channel.send(interestedInEmbedWithRows);
    await interaction.channel.send(mediaAnnouncementsEmbedWithRows);

    await interaction.reply({ content: 'Role assignment embeds sent.', ephemeral: true });
});
