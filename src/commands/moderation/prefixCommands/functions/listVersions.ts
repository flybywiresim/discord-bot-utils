import { APIEmbedField, ChatInputCommandInteraction, Colors } from 'discord.js';
import { getConn, PrefixCommandVersion, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - List Versions - No Connection',
    description: 'Could not connect to the database. Unable to list the prefix command versions.',
    color: Colors.Red,
});

const failedEmbed = (searchText: string) => makeEmbed({
    title: 'Prefix Commands - List Versions - Failed',
    description: `Failed to list the prefix command versions with search text: ${searchText}.`,
    color: Colors.Red,
});

const noResultsEmbed = (searchText: string) => makeEmbed({
    title: 'Prefix Commands - List Versions - Does not exist',
    description: `No prefix command versions found matching the search text: ${searchText}.`,
});

const successEmbed = (searchText: string, fields: APIEmbedField[]) => makeEmbed({
    title: 'Prefix Commands - Versions',
    description: searchText ? `Matching search: ${searchText}` : undefined,
    fields,
    color: Colors.Green,
});

export async function handleListPrefixCommandVersions(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const searchText = interaction.options.getString('search_text') || '';
    const foundVersions = await PrefixCommandVersion.find({ name: { $regex: searchText, $options: 'i' } });

    if (foundVersions) {
        const embedFields: APIEmbedField[] = [];
        for (let i = 0; i < foundVersions.length; i++) {
            const version = foundVersions[i];
            const { id, name, emoji, enabled, alias } = version;
            embedFields.push({
                name: `${name} - ${emoji} - ${enabled ? 'Enabled' : 'Disabled'} - ${alias}`,
                value: `${id}`,
            });
        }
        try {
            await interaction.followUp({ embeds: [successEmbed(searchText, embedFields)], ephemeral: false });
        } catch (error) {
            Logger.error(`Failed to list prefix command versions with search ${searchText}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(searchText)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [noResultsEmbed(searchText)], ephemeral: true });
    }
}
