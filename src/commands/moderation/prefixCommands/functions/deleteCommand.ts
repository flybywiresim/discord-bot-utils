import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommand, Logger, makeEmbed, clearSinglePrefixCommandCache } from '../../../../lib';

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

const doesNotExistsEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Delete Command - Does not exist',
    description: `The prefix command ${command} does not exists. Can not delete it.`,
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

    const command = interaction.options.getString('command')!;
    const moderator = interaction.user;

    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    const existingCommand = await PrefixCommand.findOne({ name: command });

    if (existingCommand) {
        const { id: commandId, name, aliases, isEmbed, embedColor } = existingCommand;
        try {
            await clearSinglePrefixCommandCache(existingCommand);
            await existingCommand.deleteOne();
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
        await interaction.followUp({ embeds: [doesNotExistsEmbed(command)], ephemeral: true });
    }
}
