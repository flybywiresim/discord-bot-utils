import { ApplicationCommandOptionType, ApplicationCommandType, CommandInteraction } from 'discord.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { slashCommand, slashCommandStructure, Logger, constantsConfig } from '../../lib';

const data = slashCommandStructure({
    name: 'generate-command-table',
    description: 'Generates the command table.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin, moderator bot developer and docs team roles
    dm_permission: false,
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

        // Build the Markdown table
        let table = '## Bot Commands\n\n| Command | Description | Subcommand and Groups |\n| --- | --- | --- |\n';

        for (const command of sortedCommands) {
            // eslint-disable-next-line prefer-const
            let { name, description, type } = command;

            const subcommandList = command.options?.filter((option) => option.type === ApplicationCommandOptionType.Subcommand || option.type === ApplicationCommandOptionType.SubcommandGroup);

            let subcommandDescription = '';

            if (subcommandList && subcommandList.length > 0) {
                subcommandDescription = subcommandList
                    .map((subcommand) => {
                        if (subcommand.type === ApplicationCommandOptionType.Subcommand) {
                            return subcommand.name;
                        }
                        if (subcommand.type === ApplicationCommandOptionType.SubcommandGroup) {
                            const groupSubcommands = subcommand.options?.filter((sub) => sub.type === ApplicationCommandOptionType.Subcommand);
                            if (groupSubcommands && groupSubcommands.length > 0) {
                                return `${subcommand.name} [${groupSubcommands
                                    .map((sub) => sub.name)
                                    .join(', ')}]`;
                            }
                            return `${subcommand.name} [None]`;
                        }
                        return '';
                    })
                    .join(', ');
            }

            // Denote context-specific commands in the description
            if (type === ApplicationCommandType.User || type === ApplicationCommandType.Message) {
                description += `(Context Command - ${type === ApplicationCommandType.User ? 'User' : 'Message'})`;
            }

            // Append subcommands to the Subcommands column
            table += `| ${name} | ${description} | ${subcommandDescription} |\n`;
        }

        // Upload the file to Cloudflare R2
        const uploadParams = {
            Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
            Key: 'utils/commands_table.md',
            Body: table,
        };

        try {
            const S3 = new S3Client({
                region: 'auto',
                endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
                },
            });

            const commandTableUpload = new PutObjectCommand(uploadParams);
            await S3.send(commandTableUpload);
            Logger.info('Successfully uploaded commands table to Cloudflare R2.');
        } catch (error) {
            Logger.error(error);
            return interaction.reply({
                content: 'An error occurred while uploading to Cloudflare R2.',
                ephemeral: true,
            });
        }

        return interaction.reply({
            content: 'Markdown table has been saved and uploaded to Cloudflare R2.',
            ephemeral: true,
        });
    } catch (error) {
        Logger.error(error);
        return interaction.reply({
            content: 'An error occurred while generating the Markdown file.',
            ephemeral: true,
        });
    }
});
