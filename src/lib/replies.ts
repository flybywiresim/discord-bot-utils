//You can use this for simple replies to slash commands
//Provides an embed with a response and a color. The reply is ephemeral meaning only the user who used the command can see it.

import { InteractionReplyOptions, InteractionEditReplyOptions } from 'discord.js';

export enum Color {
    Error = 0xf54242,
    Success = 0x42f551,
    Info = 0x4296f5,
}

export const EditReply = (msg: string, color: Color = Color.Info): InteractionEditReplyOptions => ({
    content: undefined,
    embeds: [{
        description: msg,
        color,
    }],
    components: [],
    files: [],
});

export const Reply = (msg: string, color: Color = Color.Info): InteractionReplyOptions => ({
    ephemeral: true,
    ...EditReply(msg, color) as InteractionReplyOptions,
});
