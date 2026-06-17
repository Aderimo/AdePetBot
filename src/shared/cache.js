/**
 * Cache adapter with in-memory fallback
 * Requirements: 16.5 (Cache interface compatible with Redis)
 * 
 * This adapter provides a unified interface for caching that works with both
 * in-memory storage (for development) and Redis (for production).
 * The interface matches Redis commands for easy swapping.
 */

import logger from './logger.js';

/**
 * In-memory cache implementation
 * Provides Redis-compatible interface for development/testing
 */
class InMemoryCache {
  constructor() {
    this.store = new Map();
    this.expirations = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
    
    // Cleanup expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => this._cleanup(), 60000);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<string|null>} Cached value or null
   */
  async get(key) {
    if (this._isExpired(key)) {
      this.store.delete(key);
      this.expirations.delete(key);
      this.stats.misses++;
      return null;
    }
    
    const value = this.store.get(key);
    if (value === undefined) {
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return value;
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {string} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = null) {
    this.store.set(key, value);
    this.stats.sets++;
    
    if (ttl !== null && ttl > 0) {
      const expiresAt = Date.now() + (ttl * 1000);
      this.expirations.set(key, expiresAt);
    } else {
      this.expirations.delete(key);
    }
  }

  /**
   * Set a value with expiration time (Redis SETEX command)
   * @param {string} key - Cache key
   * @param {number} seconds - TTL in seconds
   * @param {string} value - Value to cache
   * @returns {Promise<void>}
   */
  async setex(key, seconds, value) {
    return this.set(key, value, seconds);
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   * @returns {Promise<number>} Number of keys deleted (0 or 1)
   */
  async del(key) {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.expirations.delete(key);
    
    if (existed) {
      this.stats.deletes++;
      return 1;
    }
    return 0;
  }

  /**
   * Check if a key exists
   * @param {string} key - Cache key
   * @returns {Promise<number>} 1 if exists, 0 otherwise
   */
  async exists(key) {
    if (this._isExpired(key)) {
      this.store.delete(key);
      this.expirations.delete(key);
      return 0;
    }
    return this.store.has(key) ? 1 : 0;
  }

  /**
   * Set expiration on a key
   * @param {string} key - Cache key
   * @param {number} seconds - TTL in seconds
   * @returns {Promise<number>} 1 if timeout was set, 0 if key doesn't exist
   */
  async expire(key, seconds) {
    if (!this.store.has(key)) {
      return 0;
    }
    
    const expiresAt = Date.now() + (seconds * 1000);
    this.expirations.set(key, expiresAt);
    return 1;
  }

  /**
   * Get time to live for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key) {
    if (!this.store.has(key)) {
      return -2;
    }
    
    const expiresAt = this.expirations.get(key);
    if (!expiresAt) {
      return -1;
    }
    
    const ttl = Math.ceil((expiresAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  /**
   * Increment a numeric value
   * @param {string} key - Cache key
   * @returns {Promise<number>} New value after increment
   */
  async incr(key) {
    const current = await this.get(key);
    const value = current ? parseInt(current, 10) : 0;
    const newValue = value + 1;
    await this.set(key, String(newValue));
    return newValue;
  }

  /**
   * Decrement a numeric value
   * @param {string} key - Cache key
   * @returns {Promise<number>} New value after decrement
   */
  async decr(key) {
    const current = await this.get(key);
    const value = current ? parseInt(current, 10) : 0;
    const newValue = value - 1;
    await this.set(key, String(newValue));
    return newValue;
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      size: this.store.size,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  /**
   * Clear all cache entries
   * @returns {Promise<void>}
   */
  async flushall() {
    this.store.clear();
    this.expirations.clear();
  }

  /**
   * Close the cache (cleanup interval)
   * @returns {Promise<void>}
   */
  async quit() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Check if a key is expired
   * @private
   */
  _isExpired(key) {
    const expiresAt = this.expirations.get(key);
    if (!expiresAt) {
      return false;
    }
    return Date.now() >= expiresAt;
  }

  /**
   * Cleanup expired entries
   * @private
   */
  _cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, expiresAt] of this.expirations.entries()) {
      if (now >= expiresAt) {
        this.store.delete(key);
        this.expirations.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }
}

/**
 * Create a cache instance
 * Returns in-memory cache for now, can be extended to support Redis
 * @returns {InMemoryCache} Cache instance
 */
export function createCache() {
  logger.info('Initializing in-memory cache adapter');
  return new InMemoryCache();
}

export default {
  createCache,
  InMemoryCache,
};
