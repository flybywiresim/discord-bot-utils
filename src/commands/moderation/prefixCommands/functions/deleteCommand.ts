import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommand, Logger, makeEmbed, PrefixCommandContent, PrefixCommandChannelPermission, PrefixCommandRolePermission } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Delete Command - No Connection',
    description: 'Could not connect to the database. Unable to delete the prefix command.',
    color: Colors.Red,
});

const failedEmbed = (commandId: string) => makeEmbed({
    title: 'Prefix Commands - Delete Command - Failed',
    description: `Failed to delete the prefix command with id ${commandId}.`,
    color: Colors.Red,
});

const doesNotExistsEmbed = (commandId: string) => makeEmbed({
    title: 'Prefix Commands - Delete Command - Does not exist',
    description: `The prefix command with id ${commandId} does not exists. Can not delete it.`,
    color: Colors.Red,
});

const successEmbed = (command: string, commandId: string) => makeEmbed({
    title: `Prefix command ${command} (${commandId}) was deleted successfully.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, aliases: string[], isEmbed: boolean, embedColor: string, commandId: string) => makeEmbed({
    title: 'Prefix command deleted',
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
    title: 'Prefix Commands - Delete Command - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleDeletePrefixCommand(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });

    const conn = getConn();
    if (!conn) {
        await interaction.followUp({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const commandId = interaction.options.getString('id')!;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const existingCommand = await PrefixCommand.findById(commandId);

    if (existingCommand) {
        const { name, aliases, isEmbed, embedColor } = existingCommand;
        try {
            await existingCommand.deleteOne();
            const foundContents = await PrefixCommandContent.find({ commandId });
            if (foundContents) {
                for (const content of foundContents) {
                    // eslint-disable-next-line no-await-in-loop
                    await content.deleteOne();
                }
            }
            const foundChannelPermissions = await PrefixCommandChannelPermission.find({ commandId });
            if (foundChannelPermissions) {
                for (const channelPermission of foundChannelPermissions) {
                    // eslint-disable-next-line no-await-in-loop
                    await channelPermission.deleteOne();
                }
            }
            const foundRolePermissions = await PrefixCommandRolePermission.find({ commandId });
            if (foundRolePermissions) {
                for (const rolePermission of foundRolePermissions) {
                    // eslint-disable-next-line no-await-in-loop
                    await rolePermission.deleteOne();
                }
            }
            await interaction.followUp({ embeds: [successEmbed(name || '', commandId)], ephemeral: true });
            if (modLogsChannel) {
                try {
                    await modLogsChannel.send({ embeds: [modLogEmbed(moderator, name || '', aliases, isEmbed || false, embedColor || '', commandId)] });
                } catch (error) {
                    Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to delete a prefix command command with id ${commandId}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(commandId)], ephemeral: true });
        }
    } else {
        await interaction.followUp({ embeds: [doesNotExistsEmbed(commandId)], ephemeral: true });
    }
}
