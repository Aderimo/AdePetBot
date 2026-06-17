/**
 * Deploy Discord slash commands.
 * Run this script to register commands with Discord API.
 */

import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];
const commandsPath = join(__dirname, '../src/bot/commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('Loading commands...');

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(pathToFileURL(filePath).href);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`Loaded: ${command.data.name}`);
  } else {
    console.log(`Skipped: ${file} (missing data or execute)`);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

console.log(`\nDeploying ${commands.length} commands to Discord...`);

try {
  const data = await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commands },
  );

  console.log(`Successfully deployed ${data.length} commands!`);
  console.log('\nDeployed commands:');
  data.forEach(cmd => console.log(`  - /${cmd.name}: ${cmd.description}`));
} catch (error) {
  console.error('Error deploying commands:', error);
  process.exit(1);
}
