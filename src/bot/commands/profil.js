import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {
  getLeadPet,
  getOrCreatePlayerProfile,
  xpRequiredForNextLevel,
} from '../../game/players/player-service.js';

export const data = new SlashCommandBuilder()
  .setName('profil')
  .setDescription('Oyuncu profilini goruntule');

export async function execute(interaction, dependencies = {}) {
  const { user } = interaction;
  const loadProfile = dependencies.getOrCreatePlayerProfile ?? getOrCreatePlayerProfile;
  await interaction.deferReply({ ephemeral: true });

  const profile = await loadProfile(user);
  const pet = getLeadPet(profile);
  const petName = pet?.nickname || pet?.template?.name || 'Henuz pet yok';
  const passiveAbility = pet?.template?.passiveAbility || 'Henuz pasif yetenek yok';
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${user.username} profili`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: 'Seviye', value: String(profile.level), inline: true },
      {
        name: 'XP',
        value: `${profile.xp}/${xpRequiredForNextLevel(profile.level)}`,
        inline: true,
      },
      { name: 'Gold', value: profile.currency.toLocaleString('tr-TR'), inline: true },
      { name: 'Elmas', value: profile.diamonds.toLocaleString('tr-TR'), inline: true },
      { name: 'Pet', value: petName, inline: true },
      { name: 'Pet seviyesi', value: String(pet?.level ?? 1), inline: true },
      { name: 'Ruh hali', value: `${pet?.mood ?? 100}/100`, inline: true },
      { name: 'Nadirlik', value: pet?.rarity ?? 'common', inline: true },
      { name: 'Pasif yetenek', value: passiveAbility },
      { name: 'Toplam pet', value: String(profile._count.ownedPets), inline: true },
    )
    .setFooter({ text: 'AdePetBot - Pet gelistirme ve ekonomi oyunu' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
