import { ChatInputCommandInteraction, Colors, MessageFlags, User } from 'discord.js';
import { addUserNote, getConn, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Note - No Connection',
    description: 'Could not connect to the database',
    color: Colors.Red,
});

const noteFailed = makeEmbed({
    title: 'Note - Failed',
    description: 'Failed to add user note, doc not saved to mongoDB',
    color: Colors.Red,
});

const noteEmbed = (user: User) =>
    makeEmbed({
        title: `Note for ${user.tag} has been added successfully`,
        color: Colors.Green,
    });

const noModLogs = makeEmbed({
    title: 'Note - No Mod Log',
    description: 'The user note was added, but no mod log was sent. Please check the channel still exists',
    color: Colors.Red,
});

export async function handleUserNoteInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    const conn = getConn();
    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], flags: MessageFlags.Ephemeral });
        return;
    }

    const userID = interaction.options.getUser('tag_or_id')?.id;
    if (!userID) {
        await interaction.reply({ content: 'Please provide a user tag or ID.', flags: MessageFlags.Ephemeral });
        return;
    }

    const note = interaction.options.getString('note');
    if (!note) {
        await interaction.reply({ content: 'Please provide a note.', flags: MessageFlags.Ephemeral });
        return;
    }

    const discordUser = await interaction.client.users.fetch(userID);
    const moderator = interaction.user;

    const result = await addUserNote({ guild: interaction.guild, user: discordUser, moderator, note });
    if (!result.success) {
        await interaction.reply({ embeds: [noteFailed], flags: MessageFlags.Ephemeral });
        return;
    }
    if (!result.modLogSent) {
        await interaction.reply({ embeds: [noModLogs], flags: MessageFlags.Ephemeral });
        return;
    }
    await interaction.reply({ embeds: [noteEmbed(discordUser)], flags: MessageFlags.Ephemeral });
}
