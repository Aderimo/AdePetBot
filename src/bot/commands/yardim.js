import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('yardim')
  .setDescription('Kullanilabilir komutlari goruntule');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x00aa66)
    .setTitle('AdePetBot komutlari')
    .setDescription('Su an aktif olan temel komutlar:')
    .addFields(
      { name: '/ping', value: 'Botun yanit verip vermedigini test eder.' },
      { name: '/profil', value: 'Oyuncu profilini goruntuler.' },
      { name: '/yardim', value: 'Bu yardim mesajini gosterir.' },
    )
    .setFooter({ text: 'Yeni oyun komutlari faz faz eklenecek.' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
