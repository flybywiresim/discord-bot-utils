import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandCategory, Logger, makeEmbed, loadSinglePrefixCommandCategoryToCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Add Category - No Connection',
    description: 'Could not connect to the database. Unable to add the prefix command category.',
    color: Colors.Red,
});

const failedEmbed = (category: string) => makeEmbed({
    title: 'Prefix Commands - Add Category - Failed',
    description: `Failed to add the prefix command category ${category}.`,
    color: Colors.Red,
});

const alreadyExistsEmbed = (category: string) => makeEmbed({
    title: 'Prefix Commands - Add Category - Already exists',
    description: `The prefix command category ${category} already exists. Not adding again.`,
    color: Colors.Red,
});

const successEmbed = (category: string) => makeEmbed({
    title: `Prefix command category ${category} was added successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, category: string, emoji: string, categoryId: string) => makeEmbed({
    title: 'Prefix command category added',
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
    title: 'Prefix Commands - Add Category - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleAddPrefixCommandCategory(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();

    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
    }

    const name = interaction.options.getString('name')!;
    const emoji = interaction.options.getString('emoji') || '';
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
        return;
    }

    const existingCategory = await PrefixCommandCategory.findOne({ name });

    if (!existingCategory) {
        const prefixCommandCategory = new PrefixCommandCategory({
            name,
            emoji,
        });
        try {
            await prefixCommandCategory.save();
            await loadSinglePrefixCommandCategoryToCache(prefixCommandCategory.toObject(), name);
            await interaction.followUp({ embeds: [successEmbed(name)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, emoji, prefixCommandCategory.id)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to add a prefix command category ${name}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(name)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [alreadyExistsEmbed(name)], ephemeral: true });
    }
}
