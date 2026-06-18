import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execute } from '../../src/bot/commands/profil.js';

describe('/profil command', () => {
  it('defers privately and returns the persisted player profile', async () => {
    const calls = [];
    const interaction = {
      user: {
        id: 'discord-1',
        username: 'Ada',
        displayAvatarURL: () => 'https://example.com/avatar.png',
      },
      deferReply: async options => calls.push(['deferReply', options]),
      editReply: async options => calls.push(['editReply', options]),
    };

    const profile = {
      level: 3,
      xp: 45,
      currency: 1250,
      diamonds: 7,
      activeParty: [],
      _count: { ownedPets: 0 },
    };

    await execute(interaction, {
      getOrCreatePlayerProfile: async () => profile,
    });

    assert.deepStrictEqual(calls[0], ['deferReply', { ephemeral: true }]);
    assert.strictEqual(calls[1][0], 'editReply');

    const embed = calls[1][1].embeds[0].toJSON();
    assert.ok(embed.fields.some(field => field.name === 'Seviye' && field.value === '3'));
    assert.ok(embed.fields.some(field => field.name === 'Gold' && field.value.includes('1')));
  });
});
