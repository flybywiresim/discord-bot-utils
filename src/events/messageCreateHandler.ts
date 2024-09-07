import { EmbedBuilder, Message } from 'discord.js';
import { event, getInMemoryCache, Logger, Events, constantsConfig, makeEmbed, makeLines } from '../lib';
import { PrefixCommand, PrefixCommandVersion } from '../lib/schemas/prefixCommandSchemas';

const commandEmbed = (title: string, description: string, color: string, imageUrl: string = '') => makeEmbed({
    title,
    description,
    color: Number(color),
    ...(imageUrl && { image: { url: imageUrl } }),
});

async function replyWithEmbed(msg: Message, embed: EmbedBuilder) : Promise<Message<boolean>> {
    return msg.fetchReference()
        .then((res) => {
            let existingFooterText = '';
            const existingFooter = embed.data.footer;
            if (existingFooter) {
                existingFooterText = `${existingFooter.text}\n\n`;
            }
            embed = EmbedBuilder.from(embed.data);
            embed.setFooter({ text: `${existingFooterText}Executed by ${msg.author.tag} - ${msg.author.id}` });
            return res.reply({ embeds: [embed] });
        })
        .catch(() => msg.reply({ embeds: [embed] }));
}

async function replyWithMsg(msg: Message, text: string) : Promise<Message<boolean>> {
    return msg.fetchReference()
        .then((res) => res.reply(`${text}\n\n\`Executed by ${msg.author.tag} - ${msg.author.id}\``))
        .catch(() => msg.reply(text));
}

export default event(Events.MessageCreate, async (_, message) => {
    const { id: messageId, author, channel, content } = message;
    const { id: authorId, bot } = author;

    if (bot || channel.isDMBased()) return;
    const { id: channelId, guild } = channel;
    const { id: guildId } = guild;
    Logger.debug(`Processing message ${messageId} from user ${authorId} in channel ${channelId} of server ${guildId}.`);

    // TODO: Permission verification
    // TODO: If generic, check available versions and show selections

    const inMemoryCache = getInMemoryCache();
    if (inMemoryCache && content.startsWith(constantsConfig.prefixCommandPrefix)) {
        const commandTextMatch = content.match(`^\\${constantsConfig.prefixCommandPrefix}([\\w\\d-_]+)[^\\w\\d-_]*([\\w\\d-_]+)?`);
        if (commandTextMatch) {
            let [commandText] = commandTextMatch.slice(1);
            const commandVersionExplicitGeneric = (commandText.toLowerCase() === 'generic');

            // Step 1: Check if the command is actually a version alias
            const commandCachedVersion = await inMemoryCache.get(`PF_VERSION:${commandText.toLowerCase()}`);
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
                const channelDefaultVersionCached = await inMemoryCache.get(`PF_CHANNEL_VERSION:${channelId}`);
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
            const cachedCommandDetails = await inMemoryCache.get(`PF_COMMAND:${commandText.toLowerCase()}`);
            if (cachedCommandDetails) {
                const commandDetails = PrefixCommand.hydrate(cachedCommandDetails);
                const { name, contents, isEmbed, embedColor, channelPermissions, rolePermissions } = commandDetails;
                const commandContentData = contents.find(({ versionId }) => versionId === commandVersionId);
                if (!commandContentData) {
                    Logger.debug(`Prefix Command - Version "${commandVersionName}" not found for command "${name}" based on user command "${commandText}"`);
                    return;
                }
                Logger.debug(`Prefix Command - Executing version "${commandVersionName}" for command "${name}" based on user command "${commandText}"`);
                const { title: commandTitle, content: commandContent, image: commandImage } = commandContentData;
                try {
                    if (isEmbed) {
                        replyWithEmbed(message, commandEmbed(commandTitle, commandContent || '', embedColor || constantsConfig.colors.FBW_CYAN, commandImage || ''));
                    } else {
                        replyWithMsg(message, makeLines([
                            `**${commandTitle}**`,
                            ...(commandContent ? [commandContent] : []),
                        ]));
                    }
                } catch (error) {
                    Logger.error(error);
                }
            }
        }
    }
});
