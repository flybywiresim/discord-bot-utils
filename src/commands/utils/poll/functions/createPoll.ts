import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import moment from 'moment';
import { constantsConfig, durationInEnglish, Logger, makeEmbed, Poll } from '../../../../lib';

const pollAddedModLog = (pollCreator: User, title: string, description: string, duration: number, abstainAllowed: boolean, notify: string, formattedDate: string, insertedID: string) => {
    const durationText = duration === -1 ? 'Infinite' : durationInEnglish(duration);

    return makeEmbed({
        author: {
            name: `[Poll Added] ${pollCreator.tag}`,
            iconURL: pollCreator.displayAvatarURL(),
        },
        fields: [
            {
                inline: false,
                name: 'Poll Creator',
                value: `${pollCreator.tag}, ID: ${pollCreator.id}`,
            },
            {
                inline: false,
                name: 'Poll Title',
                value: title,
            },
            {
                inline: false,
                name: 'Poll Description',
                value: description,
            },
            {
                inline: false,
                name: 'Poll Duration',
                value: durationText,
            },
            {
                inline: false,
                name: 'Abstain Allowed',
                value: abstainAllowed.toString(),
            },
            {
                inline: false,
                name: 'Notify',
                value: notify,
            },
            {
                inline: false,
                name: 'Poll ID',
                value: insertedID,
            },
        ],
        footer: { text: `Timestamp: ${formattedDate}` },
        color: Colors.Green,
    });
};

export async function createPoll(interaction: ChatInputCommandInteraction<'cached'>) {
    // Get the poll details from the interaction
    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const channel = interaction.options.getChannel('channel', true);
    const duration = interaction.options.getNumber('duration', true);
    const abstainAllowed = interaction.options.getBoolean('abstain_allowed', false) || true;
    const notify = interaction.options.getString('notify', false);

    // Get the poll creator
    const pollCreator = interaction.user;

    const currentDate = new Date();

    const formattedDate: string = moment(currentDate).utcOffset(0).format();

    const guildID = interaction.guild?.id;

    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

    // Check if a poll with the same title already exists
    let pollData = await Poll.findOne({ title });

    if (!pollData) {
        // Create a new poll
        pollData = new Poll({
            guildID,
            creatorID: pollCreator.id,
            title,
            description,
            channelID: channel.id,
            duration,
            abstainAllowed,
            notify,
            isOpen: false,
        });
    } else {
        await interaction.reply({ content: 'A poll with that title already exists.', ephemeral: true });
        return;
    }

    // Save the poll to the database

    let savedPoll;

    try {
        savedPoll = await pollData.save();
    } catch (error) {
        Logger.error(error);
        await interaction.reply({ content: 'Could not add poll, error has been logged, please notify the bot team.', ephemeral: true });
        return;
    }

    // Get the poll ID
    // eslint-disable-next-line no-underscore-dangle
    const insertedID = savedPoll._id.toHexString();

    try {
        await modLogsChannel.send({ embeds: [pollAddedModLog(pollCreator, title, description, duration, abstainAllowed, notify ?? 'None', formattedDate, insertedID)] });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({ content: 'Poll added successfully, but could not send mod log, error has been logged, please notify the bot team.', ephemeral: true });
        return;
    }

    await interaction.reply({ content: `Poll added successfully. Please use the following Poll ID to add option, preview, open and close your poll: ${insertedID}`, ephemeral: true });
}
