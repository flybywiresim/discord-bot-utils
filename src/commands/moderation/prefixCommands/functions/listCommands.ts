import { APIEmbedField, ChatInputCommandInteraction, Colors } from 'discord.js';
import { getConn, PrefixCommand, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - List Commands - No Connection',
    description: 'Could not connect to the database. Unable to list the prefix commands.',
    color: Colors.Red,
});

const failedEmbed = (searchText: string) => makeEmbed({
    title: 'Prefix Commands - List Commands - Failed',
    description: `Failed to list the prefix commands with search text: ${searchText}.`,
    color: Colors.Red,
});

const noResultsEmbed = (searchText: string) => makeEmbed({
    title: 'Prefix Commands - List Commands - Does not exist',
    description: `No prefix commands found matching the search text: ${searchText}.`,
});

const successEmbed = (searchText: string, fields: APIEmbedField[]) => makeEmbed({
    title: 'Prefix Commands',
    description: searchText ? `Matching search: ${searchText}` : undefined,
    fields,
    color: Colors.Green,
});

export async function handleListPrefixCommands(interaction: ChatInputCommandInteraction<'cached'>) {
    const conn = getConn();
    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const searchText = interaction.options.getString('search_text') || '';
    const foundCommands = await PrefixCommand.find({ name: { $regex: searchText, $options: 'i' } });

    if (foundCommands) {
        const embedFields: APIEmbedField[] = [];
        for (let i = 0; i < foundCommands.length; i++) {
            const command = foundCommands[i];
            const { id, name, aliases, isEmbed, embedColor } = command;
            embedFields.push({
                name: `${name} - ${aliases.join(',')} - ${isEmbed ? 'Embed' : 'No Embed'} - ${embedColor || 'No Color'}`,
                value: `${id}`,
            });
        }
        try {
            await interaction.reply({ embeds: [successEmbed(searchText, embedFields)], ephemeral: false });
        } catch (error) {
            Logger.error(`Failed to list prefix command commands with search ${searchText}: ${error}`);
            await interaction.reply({ embeds: [failedEmbed(searchText)], ephemeral: true });
        }
    } else {
        await interaction.reply({ embeds: [noResultsEmbed(searchText)], ephemeral: true });
    }
}
