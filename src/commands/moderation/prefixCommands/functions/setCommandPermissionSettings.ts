import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, Logger, makeEmbed, PrefixCommand, PrefixCommandPermissions, refreshSinglePrefixCommandCache } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Set Permission Settings - No Connection',
    description: 'Could not connect to the database. Unable to set the permission settings.',
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Set Permission Settings - No Command',
    description: `Failed to set default channel version for command ${command} as the command does not exist.`,
    color: Colors.Red,
});

const failedEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Set Permission Settings - Failed',
    description: `Failed to set the permission settings for command ${command}.`,
    color: Colors.Red,
});

const successEmbed = (command: string) => makeEmbed({
    title: `Prefix Command permission settings set for command ${command}.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, rolesBlacklist: boolean, channelsBlacklist: boolean, quietErrors: boolean, verboseErrors: boolean) => makeEmbed({
    title: 'Prefix command version added',
    fields: [
        {
            name: 'Command',
            value: command,
        },
        {
            name: 'Roles Blacklist',
            value: rolesBlacklist ? 'Enabled' : 'Disabled',
        },
        {
            name: 'Channels Blacklist',
            value: channelsBlacklist ? 'Enabled' : 'Disabled',
        },
        {
            name: 'Quiet Errors',
            value: quietErrors ? 'Enabled' : 'Disabled',
        },
        {
            name: 'Verbose Errors',
            value: verboseErrors ? 'Enabled' : 'Disabled',
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
    ],
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Set Permission Settings - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleSetPrefixCommandPermissionSettings(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();

    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command')!;
    const rolesBlacklist = interaction.options.getBoolean('role-blacklist') || false;
    const channelsBlacklist = interaction.options.getBoolean('channel-blacklist') || false;
    const quietErrors = interaction.options.getBoolean('quiet-errors') || false;
    const verboseErrors = interaction.options.getBoolean('verbose-errors') || false;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    let foundCommands = await PrefixCommand.find({ name: command });
    if (!foundCommands || foundCommands.length > 1) {
        foundCommands = await PrefixCommand.find({ aliases: { $in: [command] } });
    }
    if (!foundCommands || foundCommands.length > 1) {
        await interaction.followUp({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }

    const [foundCommand] = foundCommands;
    if (foundCommand) {
        if (!foundCommand.permissions) {
            foundCommand.permissions = new PrefixCommandPermissions();
        }
        foundCommand.permissions.rolesBlacklist = rolesBlacklist;
        foundCommand.permissions.channelsBlacklist = channelsBlacklist;
        foundCommand.permissions.quietErrors = quietErrors;
        foundCommand.permissions.verboseErrors = verboseErrors;
        try {
            await foundCommand.save();
            await refreshSinglePrefixCommandCache(foundCommand, foundCommand);
            await interaction.followUp({ embeds: [successEmbed(command)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, command, rolesBlacklist, channelsBlacklist, quietErrors, verboseErrors)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to set the permission settings for command ${command}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(command)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [noCommandEmbed(command)], ephemeral: true });
    }
}
