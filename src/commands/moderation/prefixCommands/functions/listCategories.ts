import { APIEmbedField, ChatInputCommandInteraction, Colors } from 'discord.js';
import { getConn, PrefixCommandCategory, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - List Categories - No Connection',
    description: 'Could not connect to the database. Unable to list the prefix command categories.',
    color: Colors.Red,
});

const failedEmbed = (searchText: string) => makeEmbed({
    title: 'Prefix Commands - List Categories - Failed',
    description: `Failed to list the prefix command categories with search text: ${searchText}.`,
    color: Colors.Red,
});

const noResultsEmbed = (searchText: string) => makeEmbed({
    title: 'Prefix Commands - List Categories - Does not exist',
    description: `No prefix command categories found matching the search text: ${searchText}.`,
});

const successEmbed = (searchText: string, fields: APIEmbedField[]) => makeEmbed({
    title: 'Prefix Commands - Categories',
    description: searchText ? `Matching search: ${searchText}` : undefined,
    fields,
    color: Colors.Green,
});

export async function handleListPrefixCommandCategories(interaction: ChatInputCommandInteraction<'cached'>) {
    const conn = getConn();
    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const searchText = interaction.options.getString('search_text') || '';
    const foundCategories = await PrefixCommandCategory.find({ name: { $regex: searchText, $options: 'i' } });

    if (foundCategories) {
        const embedFields: APIEmbedField[] = [];
        for (let i = 0; i < foundCategories.length; i++) {
            const category = foundCategories[i];
            const { id, name, emoji } = category;
            embedFields.push({
                name: `${name} - ${emoji}`,
                value: `${id}`,
            });
        }
        try {
            await interaction.reply({ embeds: [successEmbed(searchText, embedFields)], ephemeral: false });
        } catch (error) {
            Logger.error(`Failed to list prefix command categories with search ${searchText}: ${error}`);
            await interaction.reply({ embeds: [failedEmbed(searchText)], ephemeral: true });
        }
    } else {
        await interaction.reply({ embeds: [noResultsEmbed(searchText)], ephemeral: true });
    }
}
