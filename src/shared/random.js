/**
 * Secure random number generation using Node crypto
 * Requirements: 2.6 (Cryptographically secure random for spawn/drop calculations)
 */

import crypto from 'crypto';

/**
 * Generate a cryptographically secure random float between 0 (inclusive) and 1 (exclusive)
 * @returns {number} Random float in [0, 1)
 */
export function randomFloat() {
  // Generate 4 random bytes (32 bits)
  const buffer = crypto.randomBytes(4);
  // Convert to unsigned 32-bit integer
  const uint32 = buffer.readUInt32BE(0);
  // Divide by max uint32 value to get float in [0, 1)
  return uint32 / 0x100000000;
}

/**
 * Generate a cryptographically secure random integer between min (inclusive) and max (inclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer in [min, max]
 */
export function randomInt(min, max) {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new Error('min and max must be integers');
  }
  
  const range = max - min + 1;
  return min + Math.floor(randomFloat() * range);
}

/**
 * Roll against a probability (0-1 range)
 * @param {number} probability - Probability of success (0-1)
 * @returns {boolean} True if roll succeeds
 */
export function rollProbability(probability) {
  if (probability < 0 || probability > 1) {
    throw new Error('probability must be between 0 and 1');
  }
  return randomFloat() < probability;
}

/**
 * Roll against a percentage (0-100 range)
 * @param {number} percentage - Percentage chance of success (0-100)
 * @returns {boolean} True if roll succeeds
 */
export function rollPercentage(percentage) {
  if (percentage < 0 || percentage > 100) {
    throw new Error('percentage must be between 0 and 100');
  }
  return randomFloat() * 100 < percentage;
}

/**
 * Select a random element from an array
 * @param {Array} array - Array to select from
 * @returns {*} Random element from array
 */
export function randomChoice(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('array must be a non-empty array');
  }
  return array[randomInt(0, array.length - 1)];
}

/**
 * Weighted random selection from an array of items with weights
 * @param {Array<{item: *, weight: number}>} items - Array of {item, weight} objects
 * @returns {*} Selected item based on weights
 */
export function weightedChoice(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }
  
  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => {
    if (typeof item.weight !== 'number' || item.weight < 0) {
      throw new Error('all weights must be non-negative numbers');
    }
    return sum + item.weight;
  }, 0);
  
  if (totalWeight === 0) {
    throw new Error('total weight must be greater than 0');
  }
  
  // Roll a random value
  const roll = randomFloat() * totalWeight;
  
  // Find the item that corresponds to this roll
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.weight;
    if (roll < cumulative) {
      return item.item;
    }
  }
  
  // Fallback (should never reach here due to floating point precision)
  return items[items.length - 1].item;
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm with secure random
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (same reference)
 */
export function shuffle(array) {
  if (!Array.isArray(array)) {
    throw new Error('input must be an array');
  }
  
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  return array;
}

/**
 * Generate a cryptographically secure random UUID v4
 * @returns {string} UUID v4 string
 */
export function randomUUID() {
  return crypto.randomUUID();
}

/**
 * Generate a cryptographically secure random hex string
 * @param {number} bytes - Number of bytes to generate
 * @returns {string} Hex string
 */
export function randomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

export default {
  randomFloat,
  randomInt,
  rollProbability,
  rollPercentage,
  randomChoice,
  weightedChoice,
  shuffle,
  randomUUID,
  randomHex,
};
