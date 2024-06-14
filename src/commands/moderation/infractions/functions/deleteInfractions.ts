import { ChatInputCommandInteraction, Colors, TextChannel, User } from 'discord.js';
import { constantsConfig, getConn, Infraction, Logger, makeEmbed } from '../../../../lib';

const noConnEmbed = makeEmbed({
    title: 'Delete - No Connection',
    description: 'Could not connect to the database',
    color: Colors.Red,
});

const noInfractionEmbed = makeEmbed({
    title: 'Delete - Infraction not found',
    description: 'This user has no infractions, please check the user ID and try again.',
    color: Colors.Red,
});

const successEmbed = makeEmbed({
    title: 'Delete - Success',
    description: 'Infraction deleted successfully',
    color: Colors.Green,
});

const noSpecificInfractionEmbed = makeEmbed({
    title: 'Delete - Infraction not found',
    description: 'This user has no infractions with that ID, please check the Infraction ID and try again.',
    color: Colors.Red,
});

const errorEmbed = makeEmbed({
    title: 'Delete - Error',
    description: 'An error occurred while deleting the infraction, the error has been logged.',
    color: Colors.Red,
});

const modLogEmbed = (moderator: string, discordUser: User, infractionType: string, infractionReason: string) =>
    makeEmbed({
        author: {
            name: `[INFRACTION DELETE]  ${discordUser.tag}`,
            iconURL: discordUser.displayAvatarURL(),
        },
        fields: [
            {
                inline: false,
                name: 'Deleted by:',
                value: moderator,
            },
            {
                inline: false,
                name: 'Infraction user:',
                value: discordUser.toString(),
            },
            {
                inline: false,
                name: 'Infraction type:',
                value: infractionType,
            },
            {
                inline: false,
                name: 'Reason',
                value: infractionReason,
            },
        ],
        color: Colors.Green,
    });

export async function handleDeleteInfraction(interaction: ChatInputCommandInteraction<'cached'>) {
    const conn = getConn();

    if (!conn) {
        await interaction.reply({ embeds: [noConnEmbed], ephemeral: true });
        return;
    }

    const userID = interaction.options.getUser('tag_or_id')!.id;

    const discordUser = await interaction.client.users.fetch(userID);

    const infractionID = interaction.options.getString('infraction_id');

    try {
        const infraction = await Infraction.findOne({ userID });

        if (!infraction) {
            await interaction.reply({ embeds: [noInfractionEmbed], ephemeral: true });
            return;
        }

        const existingInfractionIndex = infraction.infractions.findIndex(
            (item) => String(item.infractionID) === infractionID,
        );

        if (existingInfractionIndex === -1) {
            await interaction.reply({ embeds: [noSpecificInfractionEmbed], ephemeral: true });
            return;
        }

        const infractionType = infraction.infractions[existingInfractionIndex].infractionType || 'Unknown';

        const infractionReason = infraction.infractions[existingInfractionIndex].reason || 'Unknown';

        infraction.infractions.splice(existingInfractionIndex, 1);

        await infraction.save();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });

        const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

        if (modLogsChannel) {
            await modLogsChannel.send({
                embeds: [modLogEmbed(interaction.user.toString(), discordUser, infractionType, infractionReason)],
            });
        }
    } catch (error) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        Logger.error(error);
    }
}
