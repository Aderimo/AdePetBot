/**
 * Discord bot client setup.
 * Handles Discord.js client initialization and command dispatch.
 */

import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import config from '../shared/config.js';
import logger from '../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadCommands(client) {
  client.commands = new Collection();
  const commandsPath = join(__dirname, 'commands');

  try {
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    let loadedCount = 0;
    for (const file of commandFiles) {
      try {
        const filePath = join(commandsPath, file);
        const command = await import(pathToFileURL(filePath).href);

        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          loadedCount++;
          logger.info(`Loaded command: ${command.data.name}`);
        }
      } catch (error) {
        logger.error(`Failed to load command ${file}`, { error: error.message });
      }
    }

    logger.info(`Loaded ${loadedCount} commands successfully`);
  } catch (error) {
    logger.error('Failed to read commands directory', { error: error.message });
  }
}

export function createDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
      // GuildMembers is privileged; enable it here only after it is enabled in the Discord Developer Portal.
    ],
  });

  client.commands = new Collection();

  client.once('clientReady', async () => {
    logger.info(`Discord bot logged in as ${client.user.tag}`);
    await loadCommands(client);
    logger.info(`Bot is ready! Serving ${client.guilds.cache.size} servers`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logger.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
      logger.info(`Command executed: ${interaction.commandName} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error(`Error executing command ${interaction.commandName}`, {
        error: error.message,
        user: interaction.user.tag,
      });

      const errorMessage = {
        content: 'Komut calistirilirken bir hata olustu.',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  });

  client.on('error', (error) => {
    logger.error('Discord client error', { error: error.message });
  });

  return client;
}

export async function loginDiscordClient(client) {
  try {
    await client.login(config.discord.token);
    logger.info('Discord client logged in successfully');
    return client;
  } catch (error) {
    logger.error('Failed to login to Discord', { error: error.message });
    throw error;
  }
}
