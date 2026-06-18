import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getLeadPet,
  getOrCreatePlayerProfile,
  xpRequiredForNextLevel,
} from '../../src/game/players/player-service.js';

function createDatabase({ leadSlot = null } = {}) {
  const calls = {
    petCreates: 0,
    partyCreates: 0,
  };

  const profile = {
    id: 'player-1',
    discordId: 'discord-1',
    username: 'Ada',
    level: 1,
    xp: 0,
    currency: 0,
    diamonds: 0,
    activeParty: [
      {
        slot: 0,
        pet: {
          id: 'pet-1',
          nickname: 'Misket',
          level: 1,
          mood: 100,
          rarity: 'common',
          template: {
            name: 'Misket',
            passiveAbility: 'Merakli',
            species: { name: 'Yoldas Kedisi' },
          },
        },
      },
    ],
    _count: { ownedPets: 1 },
  };

  const tx = {
    player: {
      upsert: async () => ({ id: 'player-1' }),
      findUniqueOrThrow: async () => profile,
    },
    petSpecies: {
      upsert: async () => ({ id: 'species-1' }),
    },
    petTemplate: {
      upsert: async () => ({ id: 'template-1' }),
    },
    activePartySlot: {
      findUnique: async () => leadSlot,
      create: async () => {
        calls.partyCreates += 1;
        return { id: 'slot-1' };
      },
    },
    ownedPet: {
      create: async () => {
        calls.petCreates += 1;
        return { id: 'pet-1' };
      },
    },
  };

  return {
    calls,
    database: {
      $transaction: async operation => operation(tx),
    },
  };
}

describe('Player service', () => {
  it('creates one starter pet when the player has no lead pet', async () => {
    const { database, calls } = createDatabase();

    const profile = await getOrCreatePlayerProfile(
      { id: 'discord-1', username: 'Ada' },
      database,
    );

    assert.strictEqual(profile.id, 'player-1');
    assert.strictEqual(calls.petCreates, 1);
    assert.strictEqual(calls.partyCreates, 1);
    assert.strictEqual(getLeadPet(profile).nickname, 'Misket');
  });

  it('does not create another starter pet for an existing player', async () => {
    const { database, calls } = createDatabase({ leadSlot: { id: 'slot-1' } });

    await getOrCreatePlayerProfile(
      { id: 'discord-1', username: 'Ada' },
      database,
    );

    assert.strictEqual(calls.petCreates, 0);
    assert.strictEqual(calls.partyCreates, 0);
  });

  it('retries a serializable transaction conflict', async () => {
    const { database } = createDatabase({ leadSlot: { id: 'slot-1' } });
    const runTransaction = database.$transaction;
    let attempts = 0;

    database.$transaction = async (...args) => {
      attempts += 1;
      if (attempts === 1) {
        const error = new Error('Transaction conflict');
        error.code = 'P2034';
        throw error;
      }

      return runTransaction(...args);
    };

    await getOrCreatePlayerProfile(
      { id: 'discord-1', username: 'Ada' },
      database,
    );

    assert.strictEqual(attempts, 2);
  });

  it('rejects an invalid Discord user', async () => {
    const { database } = createDatabase();

    await assert.rejects(
      getOrCreatePlayerProfile({ id: 'discord-1' }, database),
      /Discord user id and username are required/,
    );
  });

  it('calculates the next level XP requirement', () => {
    assert.strictEqual(xpRequiredForNextLevel(1), 100);
    assert.strictEqual(xpRequiredForNextLevel(8), 800);
    assert.throws(() => xpRequiredForNextLevel(0), /positive integer/);
  });
});
