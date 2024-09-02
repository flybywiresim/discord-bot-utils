import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandCategory, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Modify Category - No Connection',
    description: 'Could not connect to the database. Unable to modify the prefix command category.',
    color: Colors.Red,
});

const failedEmbed = (categoryId: string) => makeEmbed({
    title: 'Prefix Commands - Modify Category - Failed',
    description: `Failed to modify the prefix command category with id ${categoryId}.`,
    color: Colors.Red,
});

const doesNotExistsEmbed = (category: string) => makeEmbed({
    title: 'Prefix Commands - Modify Category - Does not exist',
    description: `The prefix command category ${category} does not exists. Can not modify it.`,
    color: Colors.Red,
});

const successEmbed = (category: string, categoryId: string) => makeEmbed({
    title: `Prefix command category ${category} (${categoryId}) was modified successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, category: string, emoji: string, categoryId: string) => makeEmbed({
    title: 'Prefix command category modified',
    fields: [
        {
            name: 'Category',
            value: category,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
        {
            name: 'Emoji',
            value: emoji,
        },
    ],
    footer: { text: `Category ID: ${categoryId}` },
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Modified Category - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleModifyPrefixCommandCategory(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const category = interaction.options.getString('category')!;
    const name = interaction.options.getString('name') || '';
    const emoji = interaction.options.getString('emoji') || '';
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const existingCategory = await PrefixCommandCategory.findOne({ name: category });

    if (existingCategory) {
        const { id: categoryId } = existingCategory;
        existingCategory.name = name || existingCategory.name;
        existingCategory.emoji = emoji || existingCategory.emoji;
        try {
            await existingCategory.save();
            const { name, emoji } = existingCategory;
            await interaction.followUp({ embeds: [successEmbed(name, categoryId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, emoji || '', categoryId)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to modify a prefix command category with id ${categoryId}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(categoryId)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistsEmbed(category)], ephemeral: true });
    }
}
