import { ActionRowBuilder, ChatInputCommandInteraction, Colors, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle, User } from 'discord.js';
import { constantsConfig, getConn, PrefixCommandVersion, PrefixCommand, Logger, makeEmbed, refreshSinglePrefixCommandCache, PrefixCommandContent } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Prefix Commands - Set Content - No Connection',
    description: 'Could not connect to the database. Unable to set the prefix command content.',
    color: Colors.Red,
});

const noCommandEmbed = (command: string) => makeEmbed({
    title: 'Prefix Commands - Set Content - No Command',
    description: `Failed to set command content for command ${command} as the command does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const noVersionEmbed = (version: string) => makeEmbed({
    title: 'Prefix Commands - Set Content - No Version',
    description: `Failed to set command content for version ${version} as the version does not exist or there are more than one matching.`,
    color: Colors.Red,
});

const failedEmbed = (command: string, version: string) => makeEmbed({
    title: 'Prefix Commands - Set Content - Failed',
    description: `Failed to set command content for command ${command} and version ${version}.`,
    color: Colors.Red,
});

const successEmbed = (command: string, version: string) => makeEmbed({
    title: `Prefix command content set for command ${command} and version ${version}.`,
    color: Colors.Green,
});

const modLogEmbed = (moderator: User, command: string, version: string, title: string, content: string, image: string, commandId: string, versionId: string) => makeEmbed({
    title: 'Prefix command content set',
    fields: [
        {
            name: 'Command',
            value: command,
        },
        {
            name: 'Version',
            value: version,
        },
        {
            name: 'Title',
            value: title,
        },
        {
            name: 'Content',
            value: content,
        },
        {
            name: 'Image',
            value: image,
        },
        {
            name: 'Moderator',
            value: `${moderator}`,
        },
    ],
    footer: { text: `Command ID: ${commandId} - Version ID: ${versionId}` },
    color: Colors.Green,
});

const noModLogs = makeEmbed({
    title: 'Prefix Commands - Set Content - No Mod Log',
    description: 'I can\'t find the mod logs channel. Please check the channel still exists.',
    color: Colors.Red,
});

export async function handleSetPrefixCommandContent(interaction: ChatInputCommandInteraction<'cached'>) {
    const conn = getConn();
    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const command = interaction.options.getString('command')!;
    const version = interaction.options.getString('version')!;
    const moderator = interaction.user;

    let foundCommands = await PrefixCommand.find({ name: command });
    if (!foundCommands || foundCommands.length !== 1) {
        foundCommands = await PrefixCommand.find({ aliases: { $in: [command] } });
    }
    if (!foundCommands || foundCommands.length !== 1) {
        await interaction.reply({ embeds: [noCommandEmbed(command)], ephemeral: true });
        return;
    }

    const foundCommand = foundCommands[0];
    const { _id: commandId } = foundCommand;
    let versionId = '';
    let foundVersions = null;
    if (version === 'GENERIC' || version === 'generic') {
        versionId = 'GENERIC';
    } else {
        foundVersions = await PrefixCommandVersion.find({ name: version });
        if (foundVersions && foundVersions.length === 1) {
            [{ _id: versionId }] = foundVersions;
        } else {
            await interaction.reply({ embeds: [noVersionEmbed(version)], ephemeral: true });
            return;
        }
    }

    const foundContent = foundCommand.contents.find((c) => c.versionId.toString() === versionId.toString());
    const contentModal = new ModalBuilder({
        customId: 'commandContentModal',
        title: `Content for ${command} - ${version}`,
    });

    const commandContentTitle = new TextInputBuilder()
        .setCustomId('commandContentTitle')
        .setLabel('Title')
        .setPlaceholder('Provide a title for the command.')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(255)
        .setMinLength(0)
        .setRequired(false)
        .setValue(foundContent ? foundContent.title : '');

    const commandContentContent = new TextInputBuilder()
        .setCustomId('commandContentContent')
        .setLabel('Content')
        .setPlaceholder('Provide the content for the command.')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(2048)
        .setMinLength(0)
        .setRequired(false)
        .setValue(foundContent && foundContent.content ? foundContent.content : '');

    const commandContentImageUrl = new TextInputBuilder()
        .setCustomId('commandContentImageUrl')
        .setLabel('Image URL')
        .setPlaceholder('Provide an optional Image URL for the command.')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(255)
        .setMinLength(0)
        .setRequired(false)
        .setValue(foundContent && foundContent.image ? foundContent.image : '');

    const titleActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(commandContentTitle);
    const contentActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(commandContentContent);
    const imageUrlActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(commandContentImageUrl);

    contentModal.addComponents(titleActionRow);
    contentModal.addComponents(contentActionRow);
    contentModal.addComponents(imageUrlActionRow);

    await interaction.showModal(contentModal);

    const filter = (interaction: {
        customId: string;
        user: { id: any; };
    }) => interaction.customId === 'commandContentModal' && interaction.user.id;

    let title = '';
    let content = '';
    let image = '';

    try {
        //Await a modal response
        const modalSubmitInteraction = await interaction.awaitModalSubmit({
            filter,
            time: 120000,
        });

        await modalSubmitInteraction.reply({
            content: 'Processing command content data.',
            ephemeral: true,
        });

        title = modalSubmitInteraction.fields.getTextInputValue('commandContentTitle').trim();
        content = modalSubmitInteraction.fields.getTextInputValue('commandContentContent').trim();
        image = modalSubmitInteraction.fields.getTextInputValue('commandContentImageUrl').trim();
    } catch (error) {
        //Handle the error if the user does not respond in time
        Logger.error(error);
        await interaction.followUp({
            content: 'You did not provide the necessary content information and the change was not made.',
            ephemeral: true,
        });
        return;
    }
    //Check if the mod logs channel exists
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;
    if (!modLogsChannel) {
        await interaction.followUp({ embeds: [noModLogs], ephemeral: true });
    }

    if (foundContent) {
        const foundData = foundCommand.contents.find((c) => c.versionId === foundContent.versionId);
        try {
            await foundData?.deleteOne();
        } catch (error) {
            Logger.error(`Failed to delete existing content for prefix command ${command} and version ${version}: ${error}`);
            await interaction.followUp({ embeds: [failedEmbed(command, version)], ephemeral: true });
            return;
        }
    }
    const contentData = new PrefixCommandContent({
        versionId,
        title,
        content,
        image,
    });
    foundCommand.contents.push(contentData);

    try {
        await foundCommand.save();
        await refreshSinglePrefixCommandCache(foundCommand, foundCommand);
        await interaction.followUp({ embeds: [successEmbed(command, version)], ephemeral: true });
        if (modLogsChannel) {
            try {
                await modLogsChannel.send({ embeds: [modLogEmbed(moderator, command, version, title, content, image, commandId, versionId)] });
            } catch (error) {
                Logger.error(`Failed to post a message to the mod logs channel: ${error}`);
            }
        }
    } catch (error) {
        Logger.error(`Failed to set prefix command content for command ${command} and version ${version}: ${error}`);
        await interaction.followUp({ embeds: [failedEmbed(command, version)], ephemeral: true });
    }
}
