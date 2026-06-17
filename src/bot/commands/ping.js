import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Bot yanit veriyor mu test et');

export async function execute(interaction) {
  const latency = Date.now() - interaction.createdTimestamp;

  await interaction.reply({
    content: `Pong! Gecikme: ${latency}ms`,
    ephemeral: true,
  });
}
