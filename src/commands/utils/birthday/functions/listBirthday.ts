import { APIEmbedField, ChatInputCommandInteraction, EmbedField } from 'discord.js';
import { Birthday, Logger, makeEmbed } from '../../../../lib';

const birthdayListEmbed = (fields: EmbedField[]) =>
  makeEmbed({
    title: 'Birthday - Birthday List',
    description: fields.length > 0 ? undefined : 'No birthdays set',
    fields,
  });

export async function handleListBirthday(interaction: ChatInputCommandInteraction<'cached'>) {
  await interaction.deferReply();

  try {
    const birthdays = await Birthday.find({}).sort({ day: 1 }); // Only day sort required, months are bucketized
    const members = await interaction.guild.members.fetch();

    const monthBuckets: Array<[string, string[]]> = [
      ['January', []],
      ['February', []],
      ['March', []],
      ['April', []],
      ['May', []],
      ['June', []],
      ['July', []],
      ['August', []],
      ['September', []],
      ['October', []],
      ['November', []],
      ['December', []],
    ];

    for (const birthday of birthdays) {
      const member = members.get(birthday.userID!);

      if (member) {
        monthBuckets[birthday.utcDatetime!.getUTCMonth()][1].push(
          `${member.displayName} - ${birthday.day}/${birthday.month} (Z${birthday.timezone! < 0 ? '' : '+'}${birthday.timezone})`,
        );
      }
    }

    const fields: EmbedField[] = [];

    for (const monthBucket of monthBuckets) {
      if (monthBucket[1].length > 0) {
        fields.push({
          name: monthBucket[0],
          value: monthBucket[1].join('\n'),
          inline: false,
        });
      }
    }

    await interaction.editReply({ embeds: [birthdayListEmbed(fields)] });
  } catch (error) {
    Logger.error(error);
    await interaction.followUp({ content: 'An error occurred while processing this command.', ephemeral: true });
  }
}
