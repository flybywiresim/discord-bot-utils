import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, Interaction, Message } from 'discord.js';
import { event, getInMemoryCache, memoryCachePrefixCommand, memoryCachePrefixVersion, memoryCachePrefixChannelDefaultVersion, Logger, Events, constantsConfig, makeEmbed, makeLines } from '../lib';
import { PrefixCommand, PrefixCommandVersion } from '../lib/schemas/prefixCommandSchemas';

const commandEmbed = (title: string, description: string, color: string, imageUrl: string = '') => makeEmbed({
    title,
    description,
    color: Number(color),
    ...(imageUrl && { image: { url: imageUrl } }),
});

async function replyWithEmbed(msg: Message, embed: EmbedBuilder, buttonRow?: ActionRowBuilder<ButtonBuilder>) : Promise<Message<boolean>> {
    return msg.fetchReference()
        .then((res) => {
            embed = EmbedBuilder.from(embed.data);
            embed.setFooter({ text: `Executed by ${msg.author.tag} - ${msg.author.id}` });
            return res.reply({
                embeds: [embed],
                components: buttonRow ? [buttonRow] : [],
            });
        })
        .catch(() => msg.reply({
            embeds: [embed],
            components: buttonRow ? [buttonRow] : [],
        }));
}

async function replyWithMsg(msg: Message, text: string, buttonRow?:ActionRowBuilder<ButtonBuilder>) : Promise<Message<boolean>> {
    return msg.fetchReference()
        .then((res) => res.reply({
            content: `${text}\n\n\`Executed by ${msg.author.tag} - ${msg.author.id}\``,
            components: buttonRow ? [buttonRow] : [],
        }))
        .catch(() => msg.reply({
            content: text,
            components: buttonRow ? [buttonRow] : [],
        }));
}

async function sendReply(message: Message, commandTitle: string, commandContent: string, isEmbed: boolean, embedColor: string, commandImage: string, versionButtonRow?: ActionRowBuilder<ButtonBuilder>) : Promise<Message<boolean>> {
    try {
        if (isEmbed) {
            return replyWithEmbed(message, commandEmbed(commandTitle, commandContent, embedColor, commandImage), versionButtonRow);
        }
        return replyWithMsg(message, makeLines([
            `**${commandTitle}**`,
            ...(commandContent ? [commandContent] : []),
        ]), versionButtonRow);
    } catch (error) {
        Logger.error(error);
        return message.reply('An error occurred while processing the command.');
    }
}

async function expireChoiceReply(message: Message, commandTitle: string, commandContent: string, isEmbed: boolean, embedColor: string, commandImage: string) : Promise<Message<boolean>> {
    try {
        if (isEmbed) {
            const commandEmbedData = commandEmbed(commandTitle, commandContent, embedColor, commandImage);
            const { footer } = message.embeds[0];
            const newFooter = footer?.text ? `${footer.text} - The choice has expired.` : 'The choice has expired.';
            commandEmbedData.setFooter({ text: newFooter });
            return message.edit({ embeds: [commandEmbedData], components: [] });
        }

        return message.edit({
            content: makeLines([
                `**${commandTitle}**`,
                ...(commandContent ? [commandContent] : []),
                '\n`The choice has expired.`',
            ]),
            components: [],
        });
    } catch (error) {
        Logger.error(error);
        return message.reply('An error occurred while updating the message.');
    }
}

async function sendPermError(message: Message, errorText: string) {
    if (constantsConfig.prefixCommandPermissionDelay > 0) {
        errorText += `\n\nThis message & the original command message will be deleted in ${constantsConfig.prefixCommandPermissionDelay / 1000} seconds.`;
    }
    const permReply = await sendReply(message, 'Permission Error', errorText, true, constantsConfig.colors.FBW_RED, '');
    if (constantsConfig.prefixCommandPermissionDelay > 0) {
        setTimeout(() => {
            try {
                permReply.delete();
                message.delete();
            } catch (error) {
                Logger.error(`Error while deleting permission error message for command: ${error}`);
            }
        }, constantsConfig.prefixCommandPermissionDelay);
    }
}

export default event(Events.MessageCreate, async (_, message) => {
    const { id: messageId, author, channel, content } = message;
    const { id: authorId, bot } = author;

    if (bot || channel.isDMBased()) return;
    const { id: channelId, guild } = channel;
    const { id: guildId } = guild;
    Logger.debug(`Processing message ${messageId} from user ${authorId} in channel ${channelId} of server ${guildId}.`);

    const inMemoryCache = getInMemoryCache();
    if (inMemoryCache && content.startsWith(constantsConfig.prefixCommandPrefix)) {
        const commandTextMatch = content.match(`^\\${constantsConfig.prefixCommandPrefix}([\\w\\d-_]+)[^\\w\\d-_]*([\\w\\d-_]+)?`);
        if (commandTextMatch) {
            let [commandText] = commandTextMatch.slice(1);
            const commandVersionExplicitGeneric = (commandText.toLowerCase() === 'generic');

            // Step 1: Check if the command is actually a version alias
            const commandCachedVersion = await inMemoryCache.get(`${memoryCachePrefixVersion}:${commandText.toLowerCase()}`);
            let commandVersionId;
            let commandVersionName;
            let commandVersionEnabled;
            if (commandCachedVersion) {
                const commandVersion = PrefixCommandVersion.hydrate(commandCachedVersion);
                ({ id: commandVersionId, name: commandVersionName, enabled: commandVersionEnabled } = commandVersion);
            } else {
                commandVersionId = 'GENERIC';
                commandVersionName = 'GENERIC';
                commandVersionEnabled = true;
            }

            // Step 2: Check if there's a default version for the channel if commandVersionName is GENERIC
            if (commandVersionName === 'GENERIC' && !commandVersionExplicitGeneric) {
                const channelDefaultVersionCached = await inMemoryCache.get(`${memoryCachePrefixChannelDefaultVersion}:${channelId}`);
                if (channelDefaultVersionCached) {
                    const channelDefaultVersion = PrefixCommandVersion.hydrate(channelDefaultVersionCached);
                    ({ id: commandVersionId, name: commandVersionName, enabled: commandVersionEnabled } = channelDefaultVersion);
                }
            }

            // Drop execution if the version is disabled
            if (!commandVersionEnabled) {
                Logger.debug(`Prefix Command - Version "${commandVersionName}" is disabled - Not executing command "${commandText}"`);
                return;
            }

            // Step 2.5: If the first command was actually a version alias, take the actual command as CommandText
            if ((commandCachedVersion || commandVersionExplicitGeneric) && commandTextMatch[2]) {
                [commandText] = commandTextMatch.slice(2);
            }

            // Step 3: Check if the command exists itself and process it
            const cachedCommandDetails = await inMemoryCache.get(`${memoryCachePrefixCommand}:${commandText.toLowerCase()}`);
            if (cachedCommandDetails) {
                const commandDetails = PrefixCommand.hydrate(cachedCommandDetails);
                const { name, contents, isEmbed, embedColor, permissions } = commandDetails;
                const { roles: permRoles, rolesBlocklist, channels: permChannels, channelsBlocklist, quietErrors, verboseErrors } = permissions;
                const authorMember = await guild.members.fetch(authorId);

                // Check permissions
                const hasAnyRole = permRoles && permRoles.some((role) => authorMember.roles.cache.has(role));
                const isInChannel = permChannels && permChannels.includes(channelId);
                const meetsRoleRequirements = !permRoles || permRoles.length === 0
                    || (hasAnyRole && !rolesBlocklist)
                    || (!hasAnyRole && rolesBlocklist);
                const meetsChannelRequirements = !permChannels || permChannels.length === 0
                    || (isInChannel && !channelsBlocklist)
                    || (!isInChannel && channelsBlocklist);

                if (!meetsRoleRequirements) {
                    Logger.debug(`Prefix Command - User does not meet role requirements for command "${name}" based on user command "${commandText}"`);
                    if (quietErrors) return;
                    let errorText = '';
                    if (verboseErrors && !rolesBlocklist) {
                        errorText = `You do not have the required role to execute this command. Required roles: ${permRoles.map((role) => guild.roles.cache.get(role)?.name).join(', ')}.`;
                    } else if (verboseErrors && rolesBlocklist) {
                        errorText = `You have a blocklisted role for this command. Blocklisted roles: ${permRoles.map((role) => guild.roles.cache.get(role)?.name).join(', ')}.`;
                    } else if (!verboseErrors && !rolesBlocklist) {
                        errorText = 'You do not have the required role to execute this command.';
                    } else {
                        errorText = 'You have a blocklisted role for this command.';
                    }
                    await sendPermError(message, errorText);
                    return;
                }

                if (!meetsChannelRequirements) {
                    Logger.debug(`Prefix Command - Message does not meet channel requirements for command "${name}" based on user command "${commandText}"`);
                    if (quietErrors) return;
                    let errorText = '';
                    if (verboseErrors && !channelsBlocklist) {
                        errorText = `This command is not available in this channel. Required channels: ${permChannels.map((channel) => guild.channels.cache.get(channel)?.toString()).join(', ')}.`;
                    } else if (verboseErrors && channelsBlocklist) {
                        errorText = `This command is blocklisted in this channel. Blocklisted channels: ${permChannels.map((channel) => guild.channels.cache.get(channel)?.toString()).join(', ')}.`;
                    } else if (!verboseErrors && !channelsBlocklist) {
                        errorText = 'This command is not available in this channel.';
                    } else {
                        errorText = 'This command is blocklisted in this channel.';
                    }
                    await sendPermError(message, errorText);
                    return;
                }

                let commandContentData = contents.find(({ versionId }) => versionId === commandVersionId);
                // If the version is not found, try to find the generic version
                if (!commandContentData) {
                    commandContentData = contents.find(({ versionId }) => versionId === 'GENERIC');
                }
                // If the generic version is not found, drop execution
                if (!commandContentData) {
                    Logger.debug(`Prefix Command - Version "${commandVersionName}" not found for command "${name}" based on user command "${commandText}"`);
                    return;
                }
                const { title: commandTitle, content: commandContent, image: commandImage } = commandContentData;
                // If generic requested and multiple versions, show the selection
                // Note that this only applies if GENERIC is the version explicitly requested
                // Otherwise, the options are not shown
                if (commandVersionName === 'GENERIC' && contents.length > 1) {
                    Logger.debug(`Prefix Command - Multiple versions found for command "${name}" based on user command "${commandText}", showing version selection`);
                    const versionSelectionButtonData: { [key: string]: ButtonBuilder } = {};
                    for (const { versionId: versionIdForButton } of contents) {
                        // eslint-disable-next-line no-await-in-loop
                        const versionCached = await inMemoryCache.get(`${memoryCachePrefixVersion}:${versionIdForButton}`);
                        if (versionCached) {
                            const version = PrefixCommandVersion.hydrate(versionCached);
                            const { emoji } = version;
                            versionSelectionButtonData[emoji] = new ButtonBuilder()
                                .setCustomId(`${versionIdForButton}`)
                                .setEmoji(emoji)
                                .setStyle(ButtonStyle.Primary);
                        }
                    }
                    const versionSelectionButtons: ButtonBuilder[] = Object.keys(versionSelectionButtonData)
                        .sort()
                        .map((key: string) => versionSelectionButtonData[key]);
                    const versionSelectButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(versionSelectionButtons);
                    const buttonMessage = await sendReply(message, commandTitle, commandContent || '', isEmbed || false, embedColor || constantsConfig.colors.FBW_CYAN, commandImage || '', versionSelectButtonRow);

                    const filter = (interaction: Interaction) => interaction.user.id === authorId;
                    const collector = buttonMessage.createMessageComponentCollector({ filter, time: 60_000 });
                    let buttonClicked = false;
                    collector.on('collect', async (collectedInteraction: ButtonInteraction) => {
                        Logger.debug(`Prefix Command - User selected version "${collectedInteraction.customId}" for command "${name}" based on user command "${commandText}"`);
                        await collectedInteraction.deferUpdate();
                        buttonMessage.delete();
                        const { customId: selectedVersionId } = collectedInteraction;
                        const commandContentData = contents.find(({ versionId }) => versionId === selectedVersionId);
                        if (!commandContentData) {
                            Logger.debug(`Prefix Command - Version ID "${selectedVersionId}" not found for command "${name}" based on user command "${commandText}"`);
                            return;
                        }
                        const { title: commandTitle, content: commandContent, image: commandImage } = commandContentData;
                        buttonClicked = true;
                        await sendReply(message, commandTitle, commandContent || '', isEmbed || false, embedColor || constantsConfig.colors.FBW_CYAN, commandImage || '');
                    });

                    collector.on('end', async () => {
                        if (!buttonClicked) {
                            Logger.debug(`Prefix Command - User did not select a version for command "${name}" based on user command "${commandText}"`);
                            await expireChoiceReply(buttonMessage, commandTitle, commandContent || '', isEmbed || false, embedColor || constantsConfig.colors.FBW_CYAN, commandImage || '');
                        }
                    });
                } else {
                    Logger.debug(`Prefix Command - Executing version "${commandVersionName}" for command "${name}" based on user command "${commandText}"`);
                    await sendReply(message, commandTitle, commandContent || '', isEmbed || false, embedColor || constantsConfig.colors.FBW_CYAN, commandImage || '');
                }
            }
        }
    }
});
