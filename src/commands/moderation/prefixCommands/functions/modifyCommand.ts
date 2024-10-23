import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommand, Logger, makeEmbed, PrefixCommandCategory, refreshSinglePrefixCommandCache, PrefixCommandVersion } from '../../../../lib';

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

const wrongFormatEmbed = (invalidString: string) => makeEmbed({
    title: 'Prefix Commands - Modify Command - Wrong format',
    description: `The name and aliases of a command can only contain alphanumerical characters, underscores and dashes. "${invalidString}" is invalid.`,
    color: Colors.Red,
});

const categoryNotFoundEmbed = (category: string) => makeEmbed({
    title: 'Prefix Commands - Modify Command - Category not found',
    description: `The prefix command category ${category} does not exist. Please create it first.`,
    color: Colors.Red,
});

const doesNotExistsEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Modify Command - Does not exist',
    description: `The prefix command ${command} does not exists. Can not modify it.`,
    color: Colors.Red,
});

const alreadyExistsEmbed = (command: string, reason: string) => makeEmbed({
    title: 'Prefix Commands - Modify Command - Already exists',
    description: `The prefix command ${command} can not be modified: ${reason}`,
    color: Colors.Red,
});

const successEmbed = (command: string, commandId: string) => makeEmbed({
    title: `Prefix command ${command} (${commandId}) was modified successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, aliases: string[], description: string, isEmbed: boolean, embedColor: string, commandId: string) => makeEmbed({
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
            name: 'Description',
            value: description,
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
        return;
    }

    const command = interaction.options.getString('command')!;
    const name = interaction.options.getString('name')?.toLowerCase().trim() || '';
    const category = interaction.options.getString('category') || '';
    const description = interaction.options.getString('description') || '';
    const aliasesString = interaction.options.getString('aliases')?.toLowerCase().trim() || '';
    const aliases = aliasesString !== '' ? aliasesString.split(',') : [];
    const isEmbed = interaction.options.getBoolean('is_embed');
    const embedColor = interaction.options.getString('embed_color') || '';
    const moderator = interaction.user;

    const nameRegex = /^[\w-]+$/;
    if (name && !nameRegex.test(name)) {
        await interaction.followUp({ embeds: [wrongFormatEmbed(name)], ephemeral: true });
        return;
    }
    for (const alias of aliases) {
        if (!nameRegex.test(alias)) {
            // eslint-disable-next-line no-await-in-loop
            await interaction.followUp({ embeds: [wrongFormatEmbed(alias)], ephemeral: true });
            return;
        }
    }
    // Check if command name and alias are unique, additionally check if they do not exist as a version alias.
    if (name) {
        const foundCommandName = await PrefixCommand.findOne({
            name: { $ne: command },
            $or: [
                { name },
                { aliases: name },
            ],
        });
        if (foundCommandName) {
            await interaction.followUp({ embeds: [alreadyExistsEmbed(command, `${name} already exists as a different command or alias.`)], ephemeral: true });
            return;
        }
        const foundVersion = await PrefixCommandVersion.findOne({
            $or: [
                { alias: name },
            ],
        });
        if (foundVersion || name === 'generic') {
            await interaction.followUp({ embeds: [alreadyExistsEmbed(command, `${name} already exists as a version alias.`)], ephemeral: true });
            return;
        }
    }
    if (aliases.length > 0) {
        const foundCommandName = await PrefixCommand.findOne({
            name: { $ne: command },
            $or: [
                { name: { $in: aliases } },
                { aliases: { $in: aliases } },
            ],
        });
        if (foundCommandName) {
            await interaction.followUp({ embeds: [alreadyExistsEmbed(command, 'The new aliases contain an alias that already exists as a different command or alias.')], ephemeral: true });
            return;
        }
        const foundVersion = await PrefixCommandVersion.findOne({
            $or: [
                { alias: { $in: aliases } },
            ],
        });
        if (foundVersion || aliases.includes('generic')) {
            await interaction.followUp({ embeds: [alreadyExistsEmbed(command, 'The new aliases contain an alias that already exists as a version alias.')], ephemeral: true });
            return;
        }
    }

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    let foundCategory;
    if (category !== '') {
        [foundCategory] = await PrefixCommandCategory.find({ name: category });
        if (!foundCategory) {
            await interaction.followUp({ embeds: [categoryNotFoundEmbed(category)], ephemeral: true });
            return;
        }
    }
    const existingCommand = await PrefixCommand.findOne({ name: command });

    if (existingCommand) {
        const { id: commandId } = existingCommand;
        const oldCommand = existingCommand.$clone();
        existingCommand.name = name || existingCommand.name;
        existingCommand.categoryId = foundCategory?.id || existingCommand.categoryId;
        existingCommand.description = description || existingCommand.description;
        existingCommand.aliases = aliases.length > 0 ? aliases : existingCommand.aliases;
        existingCommand.isEmbed = isEmbed !== null ? isEmbed : existingCommand.isEmbed;
        existingCommand.embedColor = embedColor || existingCommand.embedColor;
        try {
            await existingCommand.save();
            const { name, description, aliases, isEmbed, embedColor } = existingCommand;
            await refreshSinglePrefixCommandCache(oldCommand, existingCommand);
            await interaction.followUp({ embeds: [successEmbed(name, commandId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, aliases, description, isEmbed || false, embedColor || '', existingCommand.id)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to modify a prefix command command with id ${commandId}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(commandId)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistsEmbed(command)], ephemeral: true });
    }
}
