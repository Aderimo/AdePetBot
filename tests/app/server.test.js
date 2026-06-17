/**
 * Integration tests for Express server with new middleware
 * Requirements: 17.5 (Standardized error responses), 25.4 (Correlation IDs)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../../src/app/server.js';

describe('Express Server Integration', () => {
  let app;
  let server;
  let baseUrl;

  before(async () => {
    app = createApp();
    server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s)); // Random port
    });
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  describe('Health Check', () => {
    it('should return 200 with status ok', async () => {
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.json();
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.status, 'ok');
      assert.ok(data.timestamp);
      assert.ok(typeof data.uptime === 'number');
    });

    it('should include correlation ID in response headers', async () => {
      const response = await fetch(`${baseUrl}/health`);
      const correlationId = response.headers.get('x-correlation-id');
      
      assert.ok(correlationId, 'Should have correlation ID header');
      assert.ok(correlationId.length > 0);
    });

    it('should accept custom correlation ID', async () => {
      const customId = 'test-correlation-123';
      const response = await fetch(`${baseUrl}/health`, {
        headers: { 'X-Correlation-ID': customId },
      });
      
      const correlationId = response.headers.get('x-correlation-id');
      assert.strictEqual(correlationId, customId);
    });
  });

  describe('API Version Endpoint', () => {
    it('should return API version info', async () => {
      const response = await fetch(`${baseUrl}/api/v1`);
      const data = await response.json();
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.version, '1.0.0');
      assert.strictEqual(data.message, 'AdePetBot API v1');
    });
  });

  describe('404 Error Handling', () => {
    it('should return standardized 404 error', async () => {
      const response = await fetch(`${baseUrl}/nonexistent`);
      const data = await response.json();
      
      assert.strictEqual(response.status, 404);
      assert.strictEqual(data.error_code, 'NOT_FOUND');
      assert.ok(data.message.includes('Endpoint not found'));
      assert.ok(data.timestamp);
    });

    it('should include correlation ID in error response', async () => {
      const response = await fetch(`${baseUrl}/nonexistent`);
      const correlationId = response.headers.get('x-correlation-id');
      
      assert.ok(correlationId);
    });
  });

  describe('Correlation ID Propagation', () => {
    it('should generate unique correlation IDs for different requests', async () => {
      const response1 = await fetch(`${baseUrl}/health`);
      const response2 = await fetch(`${baseUrl}/health`);
      
      const id1 = response1.headers.get('x-correlation-id');
      const id2 = response2.headers.get('x-correlation-id');
      
      assert.notStrictEqual(id1, id2, 'Correlation IDs should be unique');
    });
  });
});
