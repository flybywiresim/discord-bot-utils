import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, TextChannel, User } from 'discord.js';
import mongoose from 'mongoose';
import { constantsConfig, Logger, makeEmbed, Poll } from '../../../../lib';

// @ts-ignore
const setPollOptionModLog = (pollCreator: { tag: any; displayAvatarURL: () => any; id: any; }, commandExecutor: User, poll: any, optionNumber: number, option: string) => makeEmbed({
    author: {
        name: `${pollCreator.tag}`,
        iconURL: pollCreator.displayAvatarURL(),
    },
    title: `[OPTION SET] Poll: ${poll.title}`,
    fields: [
        {
            name: 'Command Executor',
            value: `${commandExecutor.tag}, ID: ${commandExecutor.id}`,
        },
        {
            name: 'Set Option',
            value: optionNumber.toString(),
        },
        {
            name: 'Set Option Content',
            value: option,
        },
    ],
    // eslint-disable-next-line no-underscore-dangle
    footer: { text: `Poll ID: ${poll._id}` },
});

export async function setOptions(interaction: ChatInputCommandInteraction<'cached'>) {
    const commandExecutor = interaction.user;

    const pollID = interaction.options.getString('poll_id', true);
    const optionNumber = interaction.options.getInteger('option_number', true);
    const option = interaction.options.getString('option_text', true);

    const isValidObjectId = mongoose.Types.ObjectId.isValid(pollID);

    if (!isValidObjectId) {
        await interaction.reply({ content: 'Invalid poll ID.', ephemeral: true });
        return;
    }

    try {
        const poll = await Poll.findOne({ _id: pollID });

        if (!poll) {
            await interaction.reply({ content: 'Poll not found.', ephemeral: true });
            return;
        }

        const modLogsChannel = interaction.guild.channels.resolve(constantsConfig.channels.MOD_LOGS) as TextChannel;

        const pollCreator = await interaction.client.users.fetch(poll.creatorID!);

        if (poll.isOpen) {
            await interaction.reply({ content: 'The poll is already open. You cannot modify options of an open poll.', ephemeral: true });
            return;
        }

        if (poll.options.find((opt) => opt?.number === optionNumber)) {
            // If the specified option number already exists, ask for confirmation
            await interaction.reply({
                content: `Option number ${optionNumber} already exists. Are you sure you want to insert a new option in between existing options?`,
                ephemeral: true,
            });

            // Add buttons for confirmation
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('pollConfirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('pollCancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger),
            );

            await interaction.followUp({
                content: 'Please confirm your choice.',
                components: [row],
                ephemeral: true,
            });

            // Wait for the user's response
            const filter = (responseInteraction: { user: { id: string; }; isButton: () => any; }) => responseInteraction.user.id === interaction.user.id && responseInteraction.isButton();

            const collector = interaction.channel!.createMessageComponentCollector({
                filter,
                time: 15000, // 15 seconds timeout for the user's response
            });

            collector.on('collect', async (buttonInteraction) => {
                // Acknowledge the button interaction
                buttonInteraction.deferUpdate();

                // Check if the user confirmed
                if (buttonInteraction.customId === 'pollConfirm') {
                    // Proceed with shifting existing options down
                    poll.options.forEach((opt) => {
                        if (opt?.number && opt.number >= optionNumber) {
                            opt.number++;
                        }
                    });

                    // Insert the new option at the specified position
                    poll.options.push({
                        number: optionNumber,
                        value: option,
                    });

                    // Sort the options array by option number after adding the new option
                    poll.options.sort((a, b) => (a?.number || 0) - (b?.number || 0));

                    await poll.save();

                    try {
                        await modLogsChannel.send({ embeds: [setPollOptionModLog(pollCreator, commandExecutor, poll, optionNumber, option)] });
                    } catch (error) {
                        Logger.error(error);
                        await interaction.followUp({ content: `Poll option ${optionNumber} set and existing options renumbered, but could not send mod log, error has been logged, please notify the bot team.`, ephemeral: true });
                    }

                    await interaction.followUp({
                        content: `Option ${optionNumber}, ${option} added successfully and existing options renumbered.`,
                        ephemeral: true,
                    });
                } else if (buttonInteraction.customId === 'pollCancel') {
                    // User canceled, do nothing or provide appropriate response
                    await interaction.followUp({
                        content: 'Option addition canceled by user.',
                        ephemeral: true,
                    });
                }

                // Stop the collector
                collector.stop();
            });

            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    // Handle if the user didn't respond in time
                    interaction.followUp({
                        content: 'Option addition canceled. You did not respond in time.',
                        ephemeral: true,
                    });
                }
            });

            return;
        }
        // If the option number doesn't exist, and it's not the expected next number, reply with an error
        const expectedOptionNumber = poll.options.length + 1;
        if (optionNumber !== expectedOptionNumber) {
            await interaction.reply({
                content: `Option numbers must be sequential. Expected option ${expectedOptionNumber}.`,
                ephemeral: true,
            });
            return;
        }

        // Insert the new option at the specified position
        poll.options.push({
            number: optionNumber,
            value: option,
        });

        // Sort the options array by option number after adding the new option
        poll.options.sort((a, b) => (a?.number || 0) - (b?.number || 0));

        await poll.save();

        try {
            await modLogsChannel.send({ embeds: [setPollOptionModLog(pollCreator, commandExecutor, poll, optionNumber, option)] });
        } catch (error) {
            Logger.error(error);
            await interaction.reply({ content: `Poll option ${optionNumber} set, but could not send mod log, error has been logged, please notify the bot team.`, ephemeral: true });
        }

        await interaction.reply({ content: `Option ${optionNumber}, ${option} added successfully.`, ephemeral: true });
    } catch (error) {
        Logger.error(error);
        await interaction.reply({
            content: 'Could not add poll options, the error has been logged. Please contact the bot team.',
            ephemeral: true,
        });
    }
}
