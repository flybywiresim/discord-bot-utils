import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { makeEmbed, createPaginatedEmbedHandler, slashCommand, slashCommandStructure, getInMemoryCache, memoryCachePrefixCommand, AutocompleteCallback, memoryCachePrefixCategory, makeLines, memoryCachePrefixVersion, Logger } from '../../lib';
import { PrefixCommand, PrefixCommandVersion, PrefixCommandCategory, IPrefixCommand } from '../../lib/schemas/prefixCommandSchemas';

const data = slashCommandStructure({
    name: 'prefix-help',
    description: 'Display a list of all the prefix commands matching an optional search.',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'category',
        description: 'The category to show the prefix commands for.',
        type: ApplicationCommandOptionType.String,
        max_length: 32,
        autocomplete: true,
        required: true,
    },
    {
        name: 'search',
        description: 'The search term to filter the prefix commands by.',
        type: ApplicationCommandOptionType.String,
        max_length: 32,
        autocomplete: true,
        required: false,
    }],
});

const autocompleteCallback: AutocompleteCallback = async ({ interaction }) => {
    const autoCompleteOption = interaction.options.getFocused(true);
    const { name: optionName, value: searchText } = autoCompleteOption;
    const choices: ApplicationCommandOptionChoiceData<string>[] = [];

    const inMemoryCache = getInMemoryCache();

    switch (optionName) {
    case 'category':
        if (inMemoryCache) {
            const foundCategories = await inMemoryCache.store.keys();
            for (const key of foundCategories) {
                if (key.startsWith(memoryCachePrefixCategory) && key.includes(searchText.toLowerCase())) {
                    // eslint-disable-next-line no-await-in-loop
                    const categoryCached = await inMemoryCache.get(key);
                    if (categoryCached) {
                        const category = PrefixCommandCategory.hydrate(categoryCached);
                        const { name } = category;
                        choices.push({ name, value: name });
                    }
                }
            }
        }
        break;
    case 'search':
        if (inMemoryCache) {
            const foundCommands = await inMemoryCache.store.keys();
            for (const key of foundCommands) {
                if (key.startsWith(memoryCachePrefixCommand) && key.includes(searchText.toLowerCase())) {
                    // Explicitly does not use the cache to hydrate the command to also capture aliases, resulting in commands
                    const commandName = key.split(':')[1];
                    choices.push({ name: commandName, value: commandName });
                }
            }
        }
        break;
    default:
        break;
    }

    return interaction.respond(choices);
};

export default slashCommand(data, async ({ interaction }) => {
    await interaction.deferReply({ ephemeral: true });

    const categoryName = interaction.options.getString('category')!;
    const search = interaction.options.getString('search') || '';

    const inMemoryCache = getInMemoryCache();
    if (!inMemoryCache) {
        return interaction.reply({
            content: 'An error occurred while fetching commands.',
            ephemeral: true,
        });
    }

    const categoryCached = await inMemoryCache.get(`${memoryCachePrefixCategory}:${categoryName.toLowerCase()}`);
    if (!categoryCached) {
        return interaction.reply({
            content: 'Invalid category, please select an existing category.',
            ephemeral: true,
        });
    }
    const category = PrefixCommandCategory.hydrate(categoryCached);

    const commands: { [key: string]: IPrefixCommand } = {};
    const keys = await inMemoryCache.store.keys();
    for (const key of keys) {
        if (key.startsWith(memoryCachePrefixCommand) && key.includes(search.toLowerCase())) {
            // eslint-disable-next-line no-await-in-loop
            const commandCached = await inMemoryCache.get(key);
            if (commandCached) {
                const command = PrefixCommand.hydrate(commandCached);
                const { name, categoryId: commandCategoryId } = command;
                const { _id: categoryId } = category;
                if (commandCategoryId.toString() === categoryId.toString() && !(name in commands)) {
                    commands[name] = command;
                }
            }
        }
    }

    const sortedCommands = Object.values(commands).sort((a, b) => a.name.localeCompare(b.name));

    const pageLimit = 10;
    const embeds = [];
    for (let page = 0; page * pageLimit < sortedCommands.length; page++) {
        const startIndex = page * pageLimit;
        const endIndex = startIndex + pageLimit;
        const currentCommands = sortedCommands.slice(startIndex, endIndex);
        const totalPages = Math.ceil(sortedCommands.length / pageLimit);

        const descriptionLines: string[] = [];
        for (const command of currentCommands) {
            const { name, aliases, description, contents } = command;
            const versionEmojis = [];
            for (const content of contents) {
                const { versionId } = content;
                if (versionId !== 'GENERIC') {
                    Logger.debug(`Fetching version ${versionId} for command ${name}`);
                    // eslint-disable-next-line no-await-in-loop
                    const versionCached = await inMemoryCache.get(`${memoryCachePrefixVersion}:${versionId}`);
                    if (versionCached) {
                        const version = PrefixCommandVersion.hydrate(versionCached);
                        const { emoji } = version;
                        Logger.debug(`Found version ${versionId} for command ${name} with emoji ${emoji}`);
                        versionEmojis.push(emoji);
                    }
                }
            }
            const sortedVersionEmojis = versionEmojis.sort((a, b) => a.localeCompare(b));
            descriptionLines.push(`**${name}** ${sortedVersionEmojis.join(', ')}`);
            descriptionLines.push(description);
            if (aliases.length > 0) descriptionLines.push(`Aliases: ${aliases.join(', ')}`);
            descriptionLines.push('');
        }

        const embed = makeEmbed({
            title: `Prefix Commands - ${category.name} (${page + 1}/${totalPages})`,
            description: makeLines(descriptionLines),
        });

        embeds.push(embed);
    }

    return createPaginatedEmbedHandler(interaction, embeds);
}, autocompleteCallback);
