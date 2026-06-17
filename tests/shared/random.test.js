/**
 * Tests for secure random helpers
 * Requirements: 2.6 (Cryptographically secure random)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  randomFloat,
  randomInt,
  rollProbability,
  rollPercentage,
  randomChoice,
  weightedChoice,
  shuffle,
  randomUUID,
  randomHex,
} from '../../src/shared/random.js';

describe('Random Helpers', () => {
  describe('randomFloat', () => {
    it('should return a number between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomFloat();
        assert.ok(value >= 0 && value < 1, `Value ${value} is not in range [0, 1)`);
      }
    });

    it('should produce different values', () => {
      const values = new Set();
      for (let i = 0; i < 100; i++) {
        values.add(randomFloat());
      }
      assert.ok(values.size > 90, 'Should produce mostly unique values');
    });
  });

  describe('randomInt', () => {
    it('should return integers in the specified range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(1, 10);
        assert.ok(Number.isInteger(value), 'Value should be an integer');
        assert.ok(value >= 1 && value <= 10, `Value ${value} is not in range [1, 10]`);
      }
    });

    it('should handle single value range', () => {
      const value = randomInt(5, 5);
      assert.strictEqual(value, 5);
    });

    it('should throw on invalid range', () => {
      assert.throws(() => randomInt(10, 5), /min must be less than or equal to max/);
    });

    it('should throw on non-integer inputs', () => {
      assert.throws(() => randomInt(1.5, 10), /min and max must be integers/);
    });
  });

  describe('rollProbability', () => {
    it('should return boolean', () => {
      const result = rollProbability(0.5);
      assert.strictEqual(typeof result, 'boolean');
    });

    it('should always succeed with probability 1', () => {
      for (let i = 0; i < 20; i++) {
        assert.strictEqual(rollProbability(1), true);
      }
    });

    it('should always fail with probability 0', () => {
      for (let i = 0; i < 20; i++) {
        assert.strictEqual(rollProbability(0), false);
      }
    });

    it('should throw on invalid probability', () => {
      assert.throws(() => rollProbability(-0.1), /probability must be between 0 and 1/);
      assert.throws(() => rollProbability(1.1), /probability must be between 0 and 1/);
    });
  });

  describe('rollPercentage', () => {
    it('should return boolean', () => {
      const result = rollPercentage(50);
      assert.strictEqual(typeof result, 'boolean');
    });

    it('should always succeed with 100%', () => {
      for (let i = 0; i < 20; i++) {
        assert.strictEqual(rollPercentage(100), true);
      }
    });

    it('should always fail with 0%', () => {
      for (let i = 0; i < 20; i++) {
        assert.strictEqual(rollPercentage(0), false);
      }
    });

    it('should throw on invalid percentage', () => {
      assert.throws(() => rollPercentage(-1), /percentage must be between 0 and 100/);
      assert.throws(() => rollPercentage(101), /percentage must be between 0 and 100/);
    });
  });

  describe('randomChoice', () => {
    it('should select an element from array', () => {
      const array = ['a', 'b', 'c', 'd'];
      const choice = randomChoice(array);
      assert.ok(array.includes(choice));
    });

    it('should handle single element array', () => {
      const choice = randomChoice(['only']);
      assert.strictEqual(choice, 'only');
    });

    it('should throw on empty array', () => {
      assert.throws(() => randomChoice([]), /array must be a non-empty array/);
    });

    it('should throw on non-array', () => {
      assert.throws(() => randomChoice('not an array'), /array must be a non-empty array/);
    });
  });

  describe('weightedChoice', () => {
    it('should select an item based on weights', () => {
      const items = [
        { item: 'common', weight: 70 },
        { item: 'rare', weight: 25 },
        { item: 'legendary', weight: 5 },
      ];
      
      const choice = weightedChoice(items);
      assert.ok(['common', 'rare', 'legendary'].includes(choice));
    });

    it('should always select item with weight 1 when others are 0', () => {
      const items = [
        { item: 'zero', weight: 0 },
        { item: 'one', weight: 1 },
        { item: 'zero2', weight: 0 },
      ];
      
      for (let i = 0; i < 10; i++) {
        assert.strictEqual(weightedChoice(items), 'one');
      }
    });

    it('should throw on empty array', () => {
      assert.throws(() => weightedChoice([]), /items must be a non-empty array/);
    });

    it('should throw on zero total weight', () => {
      const items = [
        { item: 'a', weight: 0 },
        { item: 'b', weight: 0 },
      ];
      assert.throws(() => weightedChoice(items), /total weight must be greater than 0/);
    });

    it('should throw on negative weight', () => {
      const items = [
        { item: 'a', weight: -1 },
      ];
      assert.throws(() => weightedChoice(items), /all weights must be non-negative numbers/);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array in place', () => {
      const array = [1, 2, 3, 4, 5];
      const original = [...array];
      const shuffled = shuffle(array);
      
      assert.strictEqual(shuffled, array, 'Should return same reference');
      assert.strictEqual(array.length, original.length, 'Length should not change');
      
      // Check all elements are still present
      for (const item of original) {
        assert.ok(array.includes(item), `Item ${item} should still be in array`);
      }
    });

    it('should handle single element array', () => {
      const array = [1];
      shuffle(array);
      assert.deepStrictEqual(array, [1]);
    });

    it('should throw on non-array', () => {
      assert.throws(() => shuffle('not an array'), /input must be an array/);
    });
  });

  describe('randomUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = randomUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      assert.ok(uuidRegex.test(uuid), `${uuid} is not a valid UUID v4`);
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set();
      for (let i = 0; i < 100; i++) {
        uuids.add(randomUUID());
      }
      assert.strictEqual(uuids.size, 100, 'All UUIDs should be unique');
    });
  });

  describe('randomHex', () => {
    it('should generate hex string of correct length', () => {
      const hex = randomHex(16);
      assert.strictEqual(hex.length, 32, '16 bytes should produce 32 hex characters');
      assert.ok(/^[0-9a-f]+$/i.test(hex), 'Should only contain hex characters');
    });

    it('should generate different values', () => {
      const hex1 = randomHex(16);
      const hex2 = randomHex(16);
      assert.notStrictEqual(hex1, hex2, 'Should generate different values');
    });
  });
});
