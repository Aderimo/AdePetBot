import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('profil')
  .setDescription('Oyuncu profilini goruntule');

export async function execute(interaction) {
  const { user } = interaction;

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${user.username} profili`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: 'Kullanici', value: user.username, inline: true },
      { name: 'Discord ID', value: user.id, inline: true },
      { name: 'Seviye', value: '1 (oyuncu servisi baglanacak)', inline: true },
      { name: 'XP', value: '0/100 (oyuncu servisi baglanacak)', inline: true },
      { name: 'Gold', value: '0 (ekonomi servisi baglanacak)', inline: true },
      { name: 'Pet', value: 'Baslangic pet sistemi bekliyor', inline: true },
    )
    .setFooter({ text: 'AdePetBot - Pet gelistirme ve ekonomi oyunu' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
