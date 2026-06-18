import prisma from '../../db/prisma.js';

const STARTER_SPECIES = {
  name: 'Yoldas Kedisi',
  animalFamily: 'cat',
  bodyClass: 'small',
  habitat: 'land',
  temperament: 'friendly',
  description: 'Yeni oyunculara eslik eden merakli ve dengeli bir yol arkadasi.',
};

const STARTER_TEMPLATE = {
  name: 'Misket',
  element: 'neutral',
  baseHp: 24,
  baseAtk: 7,
  baseDef: 6,
  baseSpd: 8,
  passiveAbility: 'Merakli: Aktivite odullerinde ileride kucuk bir sans bonusu saglar.',
  rarity: 'common',
};

const PROFILE_INCLUDE = {
  activeParty: {
    where: { slot: 0 },
    include: {
      pet: {
        include: {
          template: {
            include: { species: true },
          },
        },
      },
    },
  },
  _count: {
    select: { ownedPets: true },
  },
};

function isRetryableTransactionError(error) {
  return error?.code === 'P2002' || error?.code === 'P2034';
}

async function runTransactionWithRetry(database, operation, maxAttempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await database.$transaction(operation, {
        isolationLevel: 'Serializable',
      });
    } catch (error) {
      lastError = error;
      if (!isRetryableTransactionError(error) || attempt === maxAttempts) {
        throw error;
      }
    }
  }

  throw lastError;
}

function validateDiscordUser(user) {
  if (!user?.id || !user?.username) {
    throw new TypeError('Discord user id and username are required');
  }
}

export function xpRequiredForNextLevel(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError('level must be a positive integer');
  }

  return level * 100;
}

export async function getOrCreatePlayerProfile(user, database = prisma) {
  validateDiscordUser(user);

  return runTransactionWithRetry(database, async (tx) => {
    const player = await tx.player.upsert({
      where: { discordId: user.id },
      update: {
        username: user.username,
        lastLoginAt: new Date(),
      },
      create: {
        discordId: user.id,
        username: user.username,
        lastLoginAt: new Date(),
      },
    });

    const starterSpecies = await tx.petSpecies.upsert({
      where: { name: STARTER_SPECIES.name },
      update: STARTER_SPECIES,
      create: STARTER_SPECIES,
    });

    const starterTemplate = await tx.petTemplate.upsert({
      where: {
        speciesId_name: {
          speciesId: starterSpecies.id,
          name: STARTER_TEMPLATE.name,
        },
      },
      update: STARTER_TEMPLATE,
      create: {
        ...STARTER_TEMPLATE,
        speciesId: starterSpecies.id,
      },
    });

    const leadSlot = await tx.activePartySlot.findUnique({
      where: {
        playerId_slot: {
          playerId: player.id,
          slot: 0,
        },
      },
    });

    if (!leadSlot) {
      const starterPet = await tx.ownedPet.create({
        data: {
          ownerId: player.id,
          templateId: starterTemplate.id,
          nickname: STARTER_TEMPLATE.name,
          rarity: STARTER_TEMPLATE.rarity,
          element: STARTER_TEMPLATE.element,
        },
      });

      await tx.activePartySlot.create({
        data: {
          playerId: player.id,
          petId: starterPet.id,
          slot: 0,
        },
      });
    }

    return tx.player.findUniqueOrThrow({
      where: { id: player.id },
      include: PROFILE_INCLUDE,
    });
  });
}

export function getLeadPet(profile) {
  return profile?.activeParty?.find(slot => slot.slot === 0)?.pet ?? null;
}
