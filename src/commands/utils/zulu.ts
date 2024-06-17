import { ApplicationCommandOptionType, ApplicationCommandType, Colors } from 'discord.js';
import moment from 'moment';
import { slashCommand, slashCommandStructure, makeEmbed, makeLines } from '../../lib';

const data = slashCommandStructure({
  name: 'zulu',
  description: 'Get the current time at a given UTC-offset timezone.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'offset',
      description: 'Please provide a timezone within UTC-12 and UTC+14.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
});

const dateFormat = 'HH:mm (LT)';

export default slashCommand(data, async ({ interaction }) => {
  let utcOffset = interaction.options.getString('offset') ?? '0';

  utcOffset = utcOffset.replace(/^[+-]+/, (match) => match[0]);
  const numericOffset = parseInt(utcOffset);
  const sign = utcOffset.startsWith('-') ? '-' : '+';

  if (Number.isNaN(numericOffset) || numericOffset < -12 || numericOffset > 14) {
    const invalidEmbed = makeEmbed({
      title: 'Zulu Error | Invalid Offset',
      description: makeLines(['Please provide a timezone within UTC-12 and UTC+14.', 'For example: `/zulu -5`.']),
      color: Colors.Red,
    });
    return interaction.reply({ embeds: [invalidEmbed], ephemeral: true });
  }

  const formattedOffset = `${sign}${Math.abs(numericOffset)}`;

  return interaction.reply({
    content: `It is ${moment().utc().add(utcOffset, 'hours').format(dateFormat)} in that timezone (UTC${formattedOffset}).`,
  });
});
