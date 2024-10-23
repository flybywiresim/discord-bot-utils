import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommand, Logger, makeEmbed, PrefixCommandCategory, loadSinglePrefixCommandToCache, PrefixCommandVersion } from '../../../../lib';

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

const wrongFormatEmbed = (invalidString: string) => makeEmbed({
    title: 'Prefix Commands - Add Command - Wrong format',
    description: `The name and aliases of a command can only contain alphanumerical characters, underscores and dashes. ${invalidString} is invalid.`,
    color: Colors.Red,
});

const categoryNotFoundEmbed = (category: string) => makeEmbed({
    title: 'Prefix Commands - Add Command - Category not found',
    description: `The prefix command category ${category} does not exist. Please create it first.`,
    color: Colors.Red,
});

const alreadyExistsEmbed = (command: string, reason: string) => makeEmbed({
    title: 'Prefix Commands - Add Command - Already exists',
    description: `The prefix command ${command} can not be added: ${reason}`,
    color: Colors.Red,
});

const successEmbed = (command: string) => makeEmbed({
    title: `Prefix command ${command} was added successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, aliases: string[], description: string, isEmbed: boolean, embedColor: string, commandId: string) => makeEmbed({
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

    const name = interaction.options.getString('name')?.toLowerCase().trim()!;
    const category = interaction.options.getString('category')!;
    const description = interaction.options.getString('description')!;
    const aliasesString = interaction.options.getString('aliases')?.toLowerCase().trim() || '';
    const aliases = aliasesString !== '' ? aliasesString.split(',') : [];
    const isEmbed = interaction.options.getBoolean('is_embed') || false;
    const embedColor = interaction.options.getString('embed_color') || '';
    const moderator = interaction.user;

    const nameRegex = /^[\w-]+$/;
    if (!nameRegex.test(name)) {
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
    const foundCommandName = await PrefixCommand.findOne({
        $or: [
            { name },
            { name: { $in: aliases } },
            { aliases: name },
            { aliases: { $in: aliases } },
        ],
    });
    if (foundCommandName) {
        await interaction.followUp({ embeds: [alreadyExistsEmbed(name, `${name} already exists as a command or alias, or one of the aliases already exists as a command or alias.`)], ephemeral: true });
        return;
    }
    const foundVersion = await PrefixCommandVersion.findOne({
        $or: [
            { alias: name },
            { alias: { $in: aliases } },
        ],
    });
    if (foundVersion || name.toLowerCase() === 'generic' || aliases.includes('generic')) {
        await interaction.followUp({ embeds: [alreadyExistsEmbed(name, `${name} already exists as a version alias, or one of the aliases already exists as a version alias.`)], ephemeral: true });
        return;
    }

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
    const { id: categoryId } = foundCategory;
    Logger.info(`categoryId: ${categoryId}`);

    const prefixCommand = new PrefixCommand({
        name,
        categoryId,
        aliases,
        description,
        isEmbed,
        embedColor,
        contents: [],
        permissions: {
            roles: [],
            rolesBlocklist: false,
            channels: [],
            channelsBlocklist: false,
            quietErrors: false,
            verboseErrors: false,
        },
    });
    try {
        await prefixCommand.save();
        await loadSinglePrefixCommandToCache(prefixCommand);
        await interaction.followUp({ embeds: [successEmbed(name)], ephemeral: true });
        if (modLogsChannel) {
            try {
                await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name, aliases, description, isEmbed, embedColor, prefixCommand.id)] });
            } catch (error) {
                Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
            }
        }
    } catch (error) {
        Logger.error(`Failed to add a prefix command ${name}: ${error}`);
        await interaction.followUp({ embeds: [failedEmbed(name)], ephemeral: true });
    }
}
