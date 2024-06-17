import { ChatInputCommandInteraction, Colors, EmbedField } from 'discord.js';
import { Logger, makeEmbed } from '../../../../lib';

const BASE_VATSIM_URL = 'https://my.vatsim.net';

const handleLocaleTimeString = (date: Date) => date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
});

const handleLocaleDateString = (date: Date) => date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
});

export async function handleVatsimEvents(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply();

    try {
        const eventsList = await fetch(`${BASE_VATSIM_URL}/api/v1/events/all`)
            .then((res) => res.json())
            .then((res) => res.data)
            .then((res) => res.filter((event: { type: string; }) => event.type === 'Event'))
            .then((res) => res.slice(0, 5));

        const fields: EmbedField[] = eventsList.map((event: any) => {
            // eslint-disable-next-line camelcase
            const { name, organisers, end_time, start_time, link } = event;
            const { division } = organisers[0];
            const startDate = new Date(start_time);
            const endDate = new Date(end_time);
            const startTime = handleLocaleTimeString(startDate);
            const endTime = handleLocaleTimeString(endDate);
            const startDateString = handleLocaleDateString(startDate);
            const endDateString = handleLocaleDateString(endDate);

            return [
                {
                    name: 'Name',
                    value: name,
                    inline: false,
                },
                {
                    name: 'Start Time/Date',
                    value: `${startTime}/${startDateString}`,
                    inline: true,
                },
                {
                    name: 'End Time/Date',
                    value: `${endTime}/${endDateString}`,
                    inline: true,
                },
                {
                    name: 'Division',
                    value: `${division}`,
                    inline: true,
                },
                {
                    name: 'Link',
                    value: `${link}`,
                    inline: false,
                },
            ];
        }).flat();

        const eventsEmbed = makeEmbed({
            title: 'VATSIM Events',
            description: 'A list of upcoming events on the VATSIM network. Find the full list [here.](https://my.vatsim.net/events)',
            fields,
        });

        return interaction.editReply({ embeds: [eventsEmbed] });
    } catch (error: any) {
        Logger.error(error);
        const errorEmbed = makeEmbed({
            title: 'Events Error',
            description: error.message,
            color: Colors.Red,
        });
        return interaction.editReply({ embeds: [errorEmbed] });
    }
}
