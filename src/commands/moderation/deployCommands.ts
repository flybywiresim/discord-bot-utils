import { ApplicationCommandType } from 'discord.js';
import { constantsConfig, slashCommand, Logger, slashCommandStructure } from '../../lib';
import { deployCommands } from '../../scripts/deployCommands';
import commandArray from '../index';
import contextArray from '../context/index';
import { client } from '../../client';

const data = slashCommandStructure({
    name: 'deploy_commands',
    description: 'Deploy commands to the server or globally.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin, moderator and bot developer roles
    dm_permission: false,
});

export default slashCommand(data, async ({ interaction }) => {
    if (interaction.guild) {
        try {
            await deployCommands(commandArray, contextArray)
                .then(async (user) => {
                    const bot = `<@${user.id}>`;

                    const guildID = constantsConfig.guildId;
                    if (!guildID) {
                        await interaction.reply('guildId configuration constant is not defined.');
                        return;
                    }

                    const guildName = client.guilds.cache.get(guildID);

                    let response;
                    //If the bot is deployed to a guild and can resolve the name, use the guild name in the response
                    if (guildName) {
                        response = process.env.NODE_ENV === 'production'
                            ? `Deployed ${commandArray.length} commands and ${contextArray.length} contexts globally as ${bot}!`
                            : `Deployed ${commandArray.length} commands and ${contextArray.length} contexts to \`${guildName}\` as ${bot}!`;
                    } else {
                    //If the bot can't gather the guild name, use the ID in the response
                        response = process.env.NODE_ENV === 'production'
                            ? `Deployed ${commandArray.length} commands and ${contextArray.length} contexts globally as ${bot}!`
                            : `Deployed ${commandArray.length} commands and ${contextArray.length} contexts to \`<@${guildID}>\` as ${bot}!`;
                    }
                    Logger.info(response);
                    await interaction.reply({
                        content: response,
                        ephemeral: true,
                    });
                });
        } catch (error) {
            await interaction.reply({
                content: 'Failed to deploy commands!',
                ephemeral: true,
            });
            Logger.error(error);
        }
    } else {
        await interaction.reply({
            content: 'This command can only be used in a guild!',
            ephemeral: true,
        });
    }
});
