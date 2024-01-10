import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommand, Logger, makeEmbed, PrefixCommandCategory } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Add Command - No Connection',
    description: 'Could not connect to the database. Unable to add the prefix command.',
    color: Colors.Red,
});

const failedEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Add Command - Failed',
    description: `Failed to add the prefix command ${command}.`,
    color: Colors.Red,
});

const categoryNotFoundEmbed = (category: string) => makeEmbed({
    title: 'Prefix Commands - Add Command - Category not found',
    description: `The prefix command category ${category} does not exist. Please create it first.`,
    color: Colors.Red,
});

const alreadyExistsEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Add Command - Already exists',
    description: `The prefix command ${command} already exists. Not adding again.`,
    color: Colors.Red,
});

const successEmbed = (command: string) => makeEmbed({
    title: `Prefix command ${command} was added successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, aliases: string[], isEmbed: boolean, embedColor: string, commandId: string) => makeEmbed({
    title: 'Prefix command added',
    fields: [
        {
            name: 'Command',
            value: command,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
        {
            name: 'Aliases',
            value: aliases.join(','),
        },
        {
            name: 'Is Embed',
            value: isEmbed ? 'Yes' : 'No',
        },
        {
            name: 'Embed Color',
            value: embedColor || '',
        },
    ],
    footer: { text: `Command ID: ${commandId}` },
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Add Command - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleAddPrefixCommand(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();

    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const name = interaction.options.getString('name')!;
    const category = interaction.options.getString('category')!;
    const aliasesString = interaction.options.getString('aliases') || '';
    const aliases = aliasesString !== '' ? aliasesString.split(',') : [];
    const isEmbed = interaction.options.getBoolean('is_embed') || false;
    const embedColor = interaction.options.getString('embed_color') || '';
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const foundCategory = await PrefixCommandCategory.findOne({ name: category });
    if (!foundCategory) {
        await interaction.followUp({ embeds: [categoryNotFoundEmbed(category)], ephemeral: true });
        return;
    }
    const { categoryId } = foundCategory;
    const existingCommand = await PrefixCommand.findOne({ name });

    if (!existingCommand) {
        const prefixCommand = new PrefixCommand({
            name,
            categoryId,
            aliases,
            isEmbed,
            embedColor,
        });
        try {
            await prefixCommand.save();
            await interaction.followUp({ embeds: [successEmbed(name)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, aliases, isEmbed, embedColor, prefixCommand.id)] });
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
