import { Client, GatewayIntentBits } from 'discord.js';
import { constantsConfig, closeMongooseConnection, registerEvents, Logger } from './lib';
import Events from './events/index';

if (!process.env.BOT_SECRET) {
  Logger.error('Missing BOT_SECRET environment variable. Exiting...');
  process.exit(1);
}

if (!constantsConfig.guildId) {
  Logger.error('Missing guildId configuration constant. Exiting...');
  process.exit(1);
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildPresences,
  ],
});

registerEvents(client, Events);

client.login(process.env.BOT_SECRET).catch((e) => {
  Logger.error(e);
  process.exit(1);
});

const handleTermination = async () => {
  Logger.info('Terminating bot...');
  try {
    client.removeAllListeners();
    await closeMongooseConnection();
    await client.destroy();
    Logger.info('Cleanup complete. Exiting...');
    process.exit(0);
  } catch (error) {
    Logger.error('Error during termination:', error);
    process.exit(1);
  }
};

process.on('SIGINT', handleTermination);
process.on('SIGTERM', handleTermination);
