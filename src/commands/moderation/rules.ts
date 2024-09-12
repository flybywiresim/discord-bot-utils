import { ApplicationCommandType } from 'discord.js';
import { constantsConfig, slashCommand, slashCommandStructure, makeEmbed, makeLines } from '../../lib';

const data = slashCommandStructure({
  name: 'rules',
  description: 'Lists server rules.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Overrides need to be added for admin and moderator
  dm_permission: false,
});

const RULES_EMBED = makeEmbed({
  title: 'FlyByWire Simulations Server Rules',
  description: makeLines([
    'Below are the rules you must follow to participate in this discord server. Failure to abide by these rules could result in a removal from the server. Mute/ban evasions will result in a permanent ban.',
    '',
    `The <@&${constantsConfig.roles.MODERATION_TEAM}> reserve the right to action at discretion.`,
  ]),
});

const FAQ_EMBED = makeEmbed({
  title: '<:question:759405702044975114> Frequently Asked Questions',
  description: `Check the <#${constantsConfig.channels.FAQ}> for the answers to your questions prior to asking in the channels below, post your question in the appropriate channel.`,
});

const POLICIES_EMBED = makeEmbed({
  title: '<:bookmark_tabs:759405704644788256> Discord Policies',
  description: 'Whilst using Discord, you are subject to both the Terms of Service, and its Community Guidelines:',
  fields: [
    {
      name: 'ToS -',
      value: 'https://discordapp.com/terms',
    },
    {
      name: 'Guidelines -',
      value: 'https://discordapp.com/guidelines',
    },
  ],
});

const DISCUSSION_EMBED = makeEmbed({
  title: '<:speech_balloon:759405706804723742> Appropriate Discussion',
  description: makeLines([
    'The prime purpose of this server is to discuss flight sim and aviation topics. Respectful and friendly discussions of general topics in the server are welcome; however, we expect everyone to follow Discord policies and good housekeeping.',
    '',
    '- If you have a message, please post it in the appropriate channel',
    '- Send your message once; do not repeat messages',
    '- Do not send malicious or illegal content',
    '- Use of slurs or any form of bigotry is not tolerated',
    '- No inappropriate, NSFW or NSFL content like (but not limited to) nudity, pornography, gore, ...',
    '- No general spam',
    "- Do not send multiple unsolicited DM's",
    '- No troll or insensitive messaging, including insensitive inside jokes',
    '- Inappropriate/offensive profile information/picture will not be tolerated',
    '- Certain topics like politics, religion and other sensitive subjects will only be tolerated if a careful and respectful conversation is held',
    `- Self promotion is not permitted except in the case of YouTube/Twitch content etc. which can be promoted in <#${constantsConfig.channels.VIDEOS}>`,
    '- To help with moderation and set a standard the server language is English',
    '',
    'Moderators and admins will intervene when there is a risk for escalation or when the situation requires to keep the server friendly and tolerant.',
  ]),
});

const ROLE_EMBED = makeEmbed({
  title: '<:person_raising_hand:759405708994281493> Role Assignment',
  description: `We encourage people to use their vast experience and knowledge to help us create a highly detailed addon. If you have skills in Documentation, Modelling and/or Programming, please assign your <#${constantsConfig.channels.ROLES}> and get started with the conversation to help us develop the addon.`,
});

export default slashCommand(data, async ({ interaction }) => {
  if (interaction.channel) {
    await interaction.channel.send({
      embeds: [RULES_EMBED, FAQ_EMBED, POLICIES_EMBED, DISCUSSION_EMBED, ROLE_EMBED],
    });
  } else {
    await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
  }
  await interaction.reply({ content: 'Rules sent.', ephemeral: true });
});
