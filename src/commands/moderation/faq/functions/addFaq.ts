import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Colors,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
  User,
} from 'discord.js';
import { Logger, makeEmbed, FAQ } from '../../../../lib';

const faqAddedEmbed = (discordUser: User, question: string, answer: string) =>
  makeEmbed({
    author: {
      name: `[FAQ Added]  ${discordUser.tag}`,
      iconURL: discordUser.displayAvatarURL(),
    },
    fields: [
      {
        inline: false,
        name: 'Question',
        value: question,
      },
      {
        inline: false,
        name: 'Answer',
        value: answer,
      },
    ],
    color: Colors.Green,
  });

export async function handleAddFaq(interaction: ChatInputCommandInteraction<'cached'>, modLogsChannel: TextChannel) {
  const modal = new ModalBuilder({
    customId: 'faqAddModal',
    title: 'Add an FAQ entry',
  });

  const faqTitleInput = new TextInputBuilder({
    customId: 'faqTitleInput',
    label: 'Title',
    placeholder: 'Please enter the title of the FAQ.',
    style: TextInputStyle.Short,
    maxLength: 500,
    required: true,
  });

  const faqAnswerInput = new TextInputBuilder({
    customId: 'faqAnswerInput',
    label: 'Answer',
    placeholder: 'If you wish to mention a role or channel use <@&*ID*> or <#*ID*> respectively.',
    style: TextInputStyle.Paragraph,
    maxLength: 1000,
    required: true,
  });

  const titleActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(faqTitleInput);
  const answerActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(faqAnswerInput);

  modal.addComponents(titleActionRow, answerActionRow);

  await interaction.showModal(modal);

  //Modal sent

  const filter = (interaction: { customId: string; user: { id: any } }) =>
    interaction.customId === 'faqAddModal' && interaction.user.id;

  try {
    //Await a modal response
    const modalSubmitInteraction = await interaction.awaitModalSubmit({
      filter,
      time: 120000,
    });

    //Respond to the user once they have submitted the modal
    await modalSubmitInteraction.reply({
      content: 'FAQ Modal Submitted! I will try and add the FAQ to the database.',
      ephemeral: true,
    });

    const faqTitle = modalSubmitInteraction.fields.getTextInputValue('faqTitleInput');
    const faqAnswer = modalSubmitInteraction.fields.getTextInputValue('faqAnswerInput');

    const discordUser = interaction.user;
    const currentDate = new Date();

    let faqData = await FAQ.findOne({ faqTitle });

    if (!faqData) {
      faqData = new FAQ({
        faqTitle: faqTitle!,
        faqAnswer: faqAnswer!,
        moderatorID: discordUser.id,
        dateSet: currentDate,
      });
    } else {
      await interaction.followUp({
        content: 'FAQ with this title already exists. Please choose another title',
        ephemeral: true,
      });
      return;
    }

    try {
      await faqData.save();
    } catch (error) {
      Logger.error(error);
      await interaction.followUp({
        content: 'Could not add FAQ, error has been logged, please notify the bot team.',
        ephemeral: true,
      });
      return;
    }

    try {
      await modLogsChannel.send({ embeds: [faqAddedEmbed(discordUser, faqTitle, faqAnswer)] });
    } catch (error) {
      Logger.error(error);
      await interaction.followUp({
        content:
          'FAQ added successfully, but could not send mod log, error has been logged, please notify the bot team.',
        ephemeral: true,
      });
      return;
    }

    await interaction.followUp({ content: 'FAQ added successfully.', ephemeral: true });
  } catch (error) {
    //Handle the error if the user does not respond in time
    Logger.error(error);
    await interaction.followUp({
      content: 'You did not provide a response in time. Please try again.',
      ephemeral: true,
    });
  }
}
