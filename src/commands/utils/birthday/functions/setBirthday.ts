import { ChatInputCommandInteraction, Colors, User } from 'discord.js';
import { Birthday, makeEmbed } from '../../../../lib';

function isDateValid(day: number, month: number) {
  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1) {
    return false;
  }

  if (month === 2) {
    // Check for February
    if (day > 29) {
      return false;
    }
  } else if ((month <= 7 && month % 2 === 0) || (month >= 8 && month % 2 === 1)) {
    // Check for months with 30 days
    if (day > 30) {
      return false;
    }
  }

  return true;
}

const invalidDateEmbed = makeEmbed({
  title: 'Birthday - Invalid Date',
  description: 'Please provide a valid date.',
  color: Colors.Red,
});

const birthdaySetEmbed = (discordUser: User, birthdayDay: number, birthdayMonth: number, birthdayTimezone: number) =>
  makeEmbed({
    title: 'Birthday - Birthday Set',
    description: `${discordUser}'s birthday has been set to ${birthdayDay}/${birthdayMonth} and their timezone is UTC${birthdayTimezone < 0 ? '' : '+'}${birthdayTimezone}`,
  });

export async function handleSetBirthday(interaction: ChatInputCommandInteraction<'cached'>) {
  const selectedDay = interaction.options.getInteger('day')!;
  const selectedMonth = interaction.options.getInteger('month')!;
  const selectedTimezone = interaction.options.getInteger('timezone')!;

  if (!isDateValid(selectedDay, selectedMonth)) {
    await interaction.reply({ embeds: [invalidDateEmbed], ephemeral: true });
    return;
  }

  const userID = interaction.user.id;
  const discordUser = interaction.user;

  // Determine UTC datetime to send birthday message

  const currentDate = new Date();
  const utcDatetime = new Date(Date.UTC(currentDate.getUTCFullYear(), selectedMonth - 1, selectedDay));
  utcDatetime.setUTCHours(10 - selectedTimezone);

  let birthdayDoc = await Birthday.findOne({ userID });

  if (birthdayDoc) {
    birthdayDoc.month = selectedMonth;
    birthdayDoc.day = selectedDay;
    birthdayDoc.utcDatetime = utcDatetime;
    birthdayDoc.timezone = selectedTimezone;
  } else {
    birthdayDoc = new Birthday({
      userID,
      month: selectedMonth,
      day: selectedDay,
      utcDatetime,
      timezone: selectedTimezone,
    });
  }

  // If birthday already passed this year then set next year's birthday

  if (currentDate > utcDatetime) {
    utcDatetime.setUTCFullYear(utcDatetime.getUTCFullYear() + 1);
    birthdayDoc.utcDatetime = utcDatetime;
  }

  await birthdayDoc.save();

  await interaction.reply({ embeds: [birthdaySetEmbed(discordUser, selectedDay, selectedMonth, selectedTimezone)] });
}
