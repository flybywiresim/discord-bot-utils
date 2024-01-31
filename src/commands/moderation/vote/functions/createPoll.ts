import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import moment from 'moment';
import { constantsConfig, Logger, makeEmbed, Poll } from '../../../../lib';

const pollAddedEmbed = (moderator: User, title: string, description: string, duration: number, abstainAllowed: boolean, notify: string, formattedDate: string) => makeEmbed({
    author: {
        name: `[Poll Added] ${moderator.tag}`,
        iconURL: moderator.displayAvatarURL(),
    },
    fields: [
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
            value: duration.toString(),
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
    ],
    footer: { text: `Timestamp: ${formattedDate}` },
    color: Colors.Green,
});

export async function createPoll(interaction: ChatInputCommandInteraction<'cached'>) {
    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const duration = interaction.options.getNumber('duration', false) || -1;
    const abstainAllowed = interaction.options.getBoolean('abstain_allowed', false) || false;
    const notify = interaction.options.getString('notify', false) || 'none';

    const moderator = interaction.user;

    const currentDate = new Date();

    const formattedDate: string = moment(currentDate).utcOffset(0).format();

    const guildID = interaction.guild?.id;

    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

    let pollData = await Poll.findOne({ title });

    if (!pollData) {
        pollData = new Poll({
            guildID,
            moderatorID: moderator.id,
            title,
            description,
            duration,
            abstainAllowed,
            notify,
            isOpen: false,
        });
    } else {
        await interaction.reply({ content: 'A poll with that title already exists.', ephemeral: true });
        return;
    }

    try {
        await pollData.save();
    } catch (error) {
        Logger.error(error);
        await interaction.reply({ content: 'Could not add poll, error has been logged, please notify the bot team.', ephemeral: true });
        return;
    }

    try {
        await modLogsChannel.send({ embeds: [pollAddedEmbed(moderator, title, description, duration, abstainAllowed, notify, formattedDate)] });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({ content: 'Poll added successfully, but could not send mod log, error has been logged, please notify the bot team.', ephemeral: true });
        return;
    }

    await interaction.reply({ content: 'Poll added successfully.', ephemeral: true });
}
