/**
 * Tests for cache adapter
 * Requirements: 16.5 (Cache interface)
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { createCache } from '../../src/shared/cache.js';

describe('Cache Adapter', () => {
  let cache;

  beforeEach(() => {
    cache = createCache();
  });

  afterEach(async () => {
    await cache.quit();
  });

  describe('get and set', () => {
    it('should store and retrieve values', async () => {
      await cache.set('key1', 'value1');
      const value = await cache.get('key1');
      assert.strictEqual(value, 'value1');
    });

    it('should return null for non-existent keys', async () => {
      const value = await cache.get('nonexistent');
      assert.strictEqual(value, null);
    });

    it('should overwrite existing values', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key1', 'value2');
      const value = await cache.get('key1');
      assert.strictEqual(value, 'value2');
    });
  });

  describe('TTL and expiration', () => {
    it('should expire keys after TTL', async () => {
      await cache.set('key1', 'value1', 1); // 1 second TTL
      
      // Should exist immediately
      let value = await cache.get('key1');
      assert.strictEqual(value, 'value1');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      value = await cache.get('key1');
      assert.strictEqual(value, null);
    });

    it('should support setex command', async () => {
      await cache.setex('key1', 1, 'value1');
      const value = await cache.get('key1');
      assert.strictEqual(value, 'value1');
    });

    it('should return correct TTL', async () => {
      await cache.set('key1', 'value1', 10);
      const ttl = await cache.ttl('key1');
      assert.ok(ttl > 0 && ttl <= 10, `TTL ${ttl} should be between 0 and 10`);
    });

    it('should return -1 for keys without expiration', async () => {
      await cache.set('key1', 'value1');
      const ttl = await cache.ttl('key1');
      assert.strictEqual(ttl, -1);
    });

    it('should return -2 for non-existent keys', async () => {
      const ttl = await cache.ttl('nonexistent');
      assert.strictEqual(ttl, -2);
    });

    it('should set expiration on existing key', async () => {
      await cache.set('key1', 'value1');
      const result = await cache.expire('key1', 10);
      assert.strictEqual(result, 1);
      
      const ttl = await cache.ttl('key1');
      assert.ok(ttl > 0 && ttl <= 10);
    });
  });

  describe('del and exists', () => {
    it('should delete keys', async () => {
      await cache.set('key1', 'value1');
      const deleted = await cache.del('key1');
      assert.strictEqual(deleted, 1);
      
      const value = await cache.get('key1');
      assert.strictEqual(value, null);
    });

    it('should return 0 when deleting non-existent key', async () => {
      const deleted = await cache.del('nonexistent');
      assert.strictEqual(deleted, 0);
    });

    it('should check if key exists', async () => {
      await cache.set('key1', 'value1');
      
      let exists = await cache.exists('key1');
      assert.strictEqual(exists, 1);
      
      exists = await cache.exists('nonexistent');
      assert.strictEqual(exists, 0);
    });
  });

  describe('incr and decr', () => {
    it('should increment numeric values', async () => {
      await cache.set('counter', '5');
      
      let value = await cache.incr('counter');
      assert.strictEqual(value, 6);
      
      value = await cache.incr('counter');
      assert.strictEqual(value, 7);
    });

    it('should start from 0 for non-existent keys', async () => {
      const value = await cache.incr('newcounter');
      assert.strictEqual(value, 1);
    });

    it('should decrement numeric values', async () => {
      await cache.set('counter', '5');
      
      let value = await cache.decr('counter');
      assert.strictEqual(value, 4);
      
      value = await cache.decr('counter');
      assert.strictEqual(value, 3);
    });
  });

  describe('statistics', () => {
    it('should track cache hits and misses', async () => {
      await cache.set('key1', 'value1');
      
      await cache.get('key1'); // hit
      await cache.get('key1'); // hit
      await cache.get('nonexistent'); // miss
      
      const stats = cache.getStats();
      assert.strictEqual(stats.hits, 2);
      assert.strictEqual(stats.misses, 1);
      assert.strictEqual(stats.sets, 1);
    });

    it('should calculate hit rate', async () => {
      await cache.set('key1', 'value1');
      
      await cache.get('key1'); // hit
      await cache.get('nonexistent'); // miss
      
      const stats = cache.getStats();
      assert.strictEqual(stats.hitRate, '50.00%');
    });
  });

  describe('flushall', () => {
    it('should clear all cache entries', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      
      await cache.flushall();
      
      const value1 = await cache.get('key1');
      const value2 = await cache.get('key2');
      assert.strictEqual(value1, null);
      assert.strictEqual(value2, null);
    });
  });
});
