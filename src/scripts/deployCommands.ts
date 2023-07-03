import { REST, Routes, APIUser } from 'discord.js';
import { constantsConfig } from '../lib';

if (!constantsConfig.guildId) {
    throw new Error('guildId configuratoin constant is not defined.');
}

if (!process.env.BOT_SECRET) {
    throw new Error('BOT_SECRET environment variable is not defined.');
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_SECRET);

export async function deployCommands(commandArray: any[], contextArray: any[]) {
    const body = [
        ...commandArray.map((cmd) => cmd.meta),
        ...contextArray.map((ctx) => ctx.meta),
    ];
    const currentUser = await rest.get(Routes.user()) as APIUser;

    const endpoint = process.env.NODE_ENV === 'production'
        ? Routes.applicationCommands(currentUser.id)
        : Routes.applicationGuildCommands(currentUser.id, constantsConfig.guildId);

    await rest.put(endpoint, { body });

    return currentUser;
}
