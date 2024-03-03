import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommand, Logger, makeEmbed, PrefixCommandCategory } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Modify Command - No Connection',
    description: 'Could not connect to the database. Unable to modify the prefix command.',
    color: Colors.Red,
});

const failedEmbed = (commandId: string) => makeEmbed({
    title: 'Prefix Commands - Modify Command - Failed',
    description: `Failed to modify the prefix command with id ${commandId}.`,
    color: Colors.Red,
});

const categoryNotFoundEmbed = (category: string) => makeEmbed({
    title: 'Prefix Commands - Modify Command - Category not found',
    description: `The prefix command category ${category} does not exist. Please create it first.`,
    color: Colors.Red,
});

const doesNotExistsEmbed = (commandId: string) => makeEmbed({
    title: 'Prefix Commands - Modify Command - Does not exist',
    description: `The prefix command with id ${commandId} does not exists. Can not modify it.`,
    color: Colors.Red,
});

const successEmbed = (command: string, commandId: string) => makeEmbed({
    title: `Prefix command ${command} (${commandId}) was modified successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, aliases: string[], isEmbed: boolean, embedColor: string, commandId: string) => makeEmbed({
    title: 'Prefix command modified',
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
    title: 'Prefix Commands - Modified Command - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleModifyPrefixCommand(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
    }

    const commandId = interaction.options.getString('id')!;
    const name = interaction.options.getString('name') || '';
    const category = interaction.options.getString('category') || '';
    const aliasesString = interaction.options.getString('aliases') || '';
    const aliases = aliasesString !== '' ? aliasesString.split(',') : [];
    const isEmbed = interaction.options.getBoolean('is_embed') || null;
    const embedColor = interaction.options.getString('embed_color') || '';
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
        return;
    }

    let foundCategory;
    if (category !== '') {
        [foundCategory] = await PrefixCommandCategory.find({ name: category });
        if (!foundCategory) {
            await interaction.followUp({ embeds: [categoryNotFoundEmbed(category)], ephemeral: true });
            return;
        }
    }
    const existingCommand = await PrefixCommand.findById(commandId);

    if (existingCommand) {
        existingCommand.name = name || existingCommand.name;
        existingCommand.categoryId = foundCategory?.id || existingCommand.categoryId;
        existingCommand.aliases = aliases.length > 0 ? aliases : existingCommand.aliases;
        existingCommand.isEmbed = isEmbed !== null ? isEmbed : existingCommand.isEmbed;
        existingCommand.embedColor = embedColor || existingCommand.embedColor;
        try {
            await existingCommand.save();
            const { name, aliases, isEmbed, embedColor } = existingCommand;
            await interaction.followUp({ embeds: [successEmbed(name, commandId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, aliases, isEmbed || false, embedColor || '', existingCommand.id)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to modify a prefix command command with id ${commandId}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(commandId)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistsEmbed(commandId)], ephemeral: true });
    }
}
