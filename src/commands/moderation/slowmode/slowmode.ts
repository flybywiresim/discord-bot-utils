import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedField, TextChannel } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed, durationInEnglish, getScheduler } from '../../../lib';
import { handleSetSlowmode } from './functions/set';
import { handleDisableSlowmode } from './functions/disable';

const data = slashCommandStructure({
    name: 'slowmode',
    description: 'Command to manage slowmode.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator roles
    dm_permission: false,
    options: [
        {
            name: 'set',
            description: 'Set the slowmode for the channel.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'duration',
                    description: 'Please provide a duration.',
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    choices: [
                        { name: '5 Seconds', value: 5000 },
                        { name: '10 Seconds', value: 10000 },
                        { name: '15 Seconds', value: 15000 },
                        { name: '30 Seconds', value: 30000 },
                        { name: '1 Minute', value: 60000 },
                        { name: '5 minutes', value: 300000 },
                        { name: '10 minutes', value: 600000 },
                        { name: '15 minutes', value: 900000 },
                        { name: '30 minutes', value: 1800000 },
                        { name: '1 hour', value: 3600000 },
                        { name: '3 hours', value: 10800000 },
                        { name: '6 hours', value: 21600000 },
                    ],
                },
                {
                    name: 'channel',
                    description: 'Please provide a channel.',
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                },
                {
                    name: 'auto-disable',
                    description: 'Please provide a duration.',
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                    choices: [
                        { name: '1 Minute', value: 60000 },
                        { name: '5 minutes', value: 300000 },
                        { name: '10 minutes', value: 600000 },
                        { name: '15 minutes', value: 900000 },
                        { name: '30 minutes', value: 1800000 },
                        { name: '1 hour', value: 3600000 },
                        { name: '3 hours', value: 10800000 },
                        { name: '6 hours', value: 21600000 },
                        { name: '12 hours', value: 43200000 },
                        { name: '1 day', value: 86400000 },
                        { name: '3 days', value: 259200000 },
                        { name: '1 week', value: 604800000 },
                    ],
                },
            ],
        },
        {
            name: 'disable',
            description: 'Disable the slowmode for the channel.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'Please provide a channel.',
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                },
            ],
        },
    ],
});

const noSchedulerEmbed = makeEmbed({
    title: 'Slow Mode - No scheduler',
    description: 'Could not find an active scheduler. No automatic disable can be scheduled.',
    color: Colors.Red,
});

const failedEmbed = (action: string, channel: string) => makeEmbed({
    title: `Slow Mode - ${action} failed`,
    description: `Failed to ${action} the slow mode for channel <@${channel}>.`,
    color: Colors.Red,
});

const modLogEmbed = (action: string, fields: any, color: number) => makeEmbed({
    title: `Slow Mode - ${action}`,
    fields,
    color,
});

const slowModeEmbedField = (moderator: string, channel: string, duration: number, autoDisable: string): EmbedField[] => [
    {
        inline: true,
        name: 'Channel',
        value: `<#${channel}>`,
    },
    {
        inline: true,
        name: 'Slow mode limit',
        value: durationInEnglish(duration),
    },
    {
        inline: true,
        name: 'Auto disable timeout',
        value: durationInEnglish(autoDisable),
    },
    {
        inline: true,
        name: 'Moderator',
        value: moderator,
    },
];

const noChannelEmbed = (action:string, channelName: string) => makeEmbed({
    title: `Slow Mode - ${action} - No ${channelName} channel`,
    description: `The command was successful, but no message to ${channelName} was sent. Please check the channel still exists.`,
    color: Colors.Yellow,
});

const successEmbed = (action: string, channel: string) => makeEmbed({
    title: `Slow Mode - ${action} successful`,
    description: `Slow mode for channel <#${channel}> has been ${action} successfully.`,
    color: Colors.Green,
});

export default slashCommand(data, async ({ interaction }) => {
    const scheduler = getScheduler();
    if (!scheduler) {
        await interaction.reply({ embeds: [noSchedulerEmbed] });
    }

    const duration = interaction.options.getNumber('duration')!;
    const slowmodeChannel = interaction.options.getChannel('channel')! ?? interaction.channel;
    const autoDisable = interaction.options.getNumber('auto-disable');
    const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

    const subcommandName = interaction.options.getSubcommand();

    switch (subcommandName) {
    case 'set':
        await handleSetSlowmode(interaction, duration, slowmodeChannel, autoDisable, modLogsChannel, scheduler, failedEmbed, noChannelEmbed, successEmbed, modLogEmbed, slowModeEmbedField);
        break;
    case 'disable':
        await handleDisableSlowmode(interaction, slowmodeChannel, modLogsChannel, scheduler, failedEmbed, noChannelEmbed, successEmbed, modLogEmbed, slowModeEmbedField);
        break;

    default:
        await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    }
});
