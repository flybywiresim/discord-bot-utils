import { ApplicationCommandOptionType, ApplicationCommandType, CommandInteraction } from 'discord.js';
import { Logger, makeEmbed, createPaginatedEmbedHandler, slashCommand, slashCommandStructure } from '../../lib';

// May need re wrting to pull commands from index instead of the API

const data = slashCommandStructure({
    name: 'help',
    description: 'Display a list of all commands and subcommands.',
    type: ApplicationCommandType.ChatInput,
});

export default slashCommand(data, async ({ interaction }: { interaction: CommandInteraction }) => {
    try {
        // Fetch all commands from the API based on the environment

        let commands;

        if (process.env.NODE_ENV === 'production') {
            commands = await interaction.client.application?.commands.fetch();
        } else {
            commands = await interaction.guild?.commands.fetch();
        }

        // Check if the commands were fetched successfully

        if (!commands) {
            return interaction.reply({
                content: 'An error occurred while fetching commands.',
                ephemeral: true,
            });
        }

        // Convert the iterable of commands into an array
        const commandArray = Array.from(commands.values());

        // Sort the commands alphabetically by name
        const sortedCommands = commandArray.sort((a, b) => a.name.localeCompare(b.name));

        // Generate an array of embeds for all pages
        const pageLimit = 10;
        const embeds = [];
        for (let page = 0; page * pageLimit < sortedCommands.length; page++) {
            const startIndex = page * pageLimit;
            const endIndex = startIndex + pageLimit;
            const currentCommands = sortedCommands.slice(startIndex, endIndex);
            const totalPages = Math.ceil(sortedCommands.length / pageLimit);

            // Build the description with subcommands and subcommand groups
            const description = currentCommands.map((command) => {
                let { description } = command;

                // Check if it's a context-specific message command
                const isMessageCommand = command.type === ApplicationCommandType.Message;

                // Check if it's a context-specific user command
                const isUserCommand = command.type === ApplicationCommandType.User;

                const subcommandList = command.options?.filter(
                    (option) => option.type === ApplicationCommandOptionType.Subcommand
                        || option.type === ApplicationCommandOptionType.SubcommandGroup,
                );

                if (subcommandList && subcommandList.length > 0) {
                    const subcommandDescription = subcommandList
                        .map((subcommand) => {
                            if (subcommand.type === ApplicationCommandOptionType.Subcommand) {
                                return subcommand.name;
                            }
                            if (subcommand.type === ApplicationCommandOptionType.SubcommandGroup) {
                                const groupSubcommands = subcommand.options?.filter(
                                    (sub) => sub.type === ApplicationCommandOptionType.Subcommand,
                                );
                                if (groupSubcommands && groupSubcommands.length > 0) {
                                    return `${subcommand.name} [${groupSubcommands
                                        .map((sub) => sub.name)
                                        .join(', ')}]`;
                                }
                                return `${subcommand.name} [None]`;
                            }
                            return '';
                        })
                        .join(', '); // Use a comma to separate subcommands
                    description += `\n**Subcommands and Groups:** \n${subcommandDescription}`;
                }

                // Append a label for context-specific message and user commands
                if (isMessageCommand) {
                    description += '\n(Context Command - Message)';
                } else if (isUserCommand) {
                    description += '\n(Context Command - User)';
                }

                return `**${command.name}**: ${description}`;
            }).join('\n\n');

            const embed = makeEmbed({
                title: `Bot Commands - Page ${page + 1} of ${totalPages}`,
                description,
            });
            embeds.push(embed);
        }

        // Use the pagination function to send the paginated embeds
        return createPaginatedEmbedHandler(interaction, embeds);
    } catch (error) {
        Logger.error(error);
        return interaction.reply({
            content: 'An error occurred while fetching commands.',
            ephemeral: true,
        });
        // Handle errors appropriately
    }
});
