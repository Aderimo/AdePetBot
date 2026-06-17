/**
 * Tests for typed application errors
 * Requirements: 17.5 (Standardized error responses)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InsufficientResourcesError,
  InventoryFullError,
  MissingPrerequisiteError,
  InvalidStateError,
  DatabaseError,
  ExternalServiceError,
  isAppError,
} from '../../src/shared/errors.js';

describe('Application Errors', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('TEST_ERROR', 'Test message', 400, { foo: 'bar' });
      
      assert.strictEqual(error.code, 'TEST_ERROR');
      assert.strictEqual(error.message, 'Test message');
      assert.strictEqual(error.statusCode, 400);
      assert.deepStrictEqual(error.context, { foo: 'bar' });
      assert.ok(error.timestamp);
      assert.ok(error.stack);
    });

    it('should convert to JSON format', () => {
      const error = new AppError('TEST_ERROR', 'Test message', 400, { foo: 'bar' });
      const json = error.toJSON();
      
      assert.strictEqual(json.error_code, 'TEST_ERROR');
      assert.strictEqual(json.message, 'Test message');
      assert.ok(json.timestamp);
      assert.deepStrictEqual(json.context, { foo: 'bar' });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');
      
      assert.strictEqual(error.code, 'VALIDATION_ERROR');
      assert.strictEqual(error.statusCode, 400);
      assert.strictEqual(error.message, 'Invalid input');
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError();
      
      assert.strictEqual(error.code, 'AUTHENTICATION_ERROR');
      assert.strictEqual(error.statusCode, 401);
      assert.strictEqual(error.message, 'Authentication required');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');
      assert.strictEqual(error.message, 'Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with 403 status', () => {
      const error = new AuthorizationError();
      
      assert.strictEqual(error.code, 'AUTHORIZATION_ERROR');
      assert.strictEqual(error.statusCode, 403);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with resource details', () => {
      const error = new NotFoundError('Pet', '123');
      
      assert.strictEqual(error.code, 'NOT_FOUND');
      assert.strictEqual(error.statusCode, 404);
      assert.strictEqual(error.message, 'Pet not found: 123');
      assert.strictEqual(error.context.resource, 'Pet');
      assert.strictEqual(error.context.identifier, '123');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with 409 status', () => {
      const error = new ConflictError('Resource already exists');
      
      assert.strictEqual(error.code, 'CONFLICT');
      assert.strictEqual(error.statusCode, 409);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with 429 status', () => {
      const error = new RateLimitError();
      
      assert.strictEqual(error.code, 'RATE_LIMIT_EXCEEDED');
      assert.strictEqual(error.statusCode, 429);
    });
  });

  describe('InsufficientResourcesError', () => {
    it('should create error with resource details', () => {
      const error = new InsufficientResourcesError('Shadow Shards', 5, 2);
      
      assert.strictEqual(error.code, 'INSUFFICIENT_RESOURCES');
      assert.strictEqual(error.statusCode, 400);
      assert.strictEqual(error.message, 'Insufficient Shadow Shards: required 5, available 2');
      assert.strictEqual(error.context.resource, 'Shadow Shards');
      assert.strictEqual(error.context.required, 5);
      assert.strictEqual(error.context.available, 2);
    });
  });

  describe('InventoryFullError', () => {
    it('should create error with category', () => {
      const error = new InventoryFullError('pets');
      
      assert.strictEqual(error.code, 'INVENTORY_FULL');
      assert.strictEqual(error.statusCode, 400);
      assert.strictEqual(error.message, 'pets inventory is full');
      assert.strictEqual(error.context.category, 'pets');
    });
  });

  describe('MissingPrerequisiteError', () => {
    it('should create error with prerequisite details', () => {
      const error = new MissingPrerequisiteError('Level 10 required');
      
      assert.strictEqual(error.code, 'MISSING_PREREQUISITE');
      assert.strictEqual(error.statusCode, 400);
      assert.strictEqual(error.message, 'Missing prerequisite: Level 10 required');
      assert.strictEqual(error.context.prerequisite, 'Level 10 required');
    });
  });

  describe('InvalidStateError', () => {
    it('should create error with state details', () => {
      const error = new InvalidStateError('Pet', 'locked');
      
      assert.strictEqual(error.code, 'INVALID_STATE');
      assert.strictEqual(error.statusCode, 400);
      assert.strictEqual(error.message, 'Pet is in invalid state: locked');
      assert.strictEqual(error.context.resource, 'Pet');
      assert.strictEqual(error.context.state, 'locked');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with 500 status', () => {
      const error = new DatabaseError('Connection failed');
      
      assert.strictEqual(error.code, 'DATABASE_ERROR');
      assert.strictEqual(error.statusCode, 500);
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error with service name', () => {
      const error = new ExternalServiceError('PaymentAPI', 'Timeout');
      
      assert.strictEqual(error.code, 'EXTERNAL_SERVICE_ERROR');
      assert.strictEqual(error.statusCode, 502);
      assert.strictEqual(error.message, 'PaymentAPI error: Timeout');
      assert.strictEqual(error.context.service, 'PaymentAPI');
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new ValidationError('Test');
      assert.strictEqual(isAppError(error), true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Test');
      assert.strictEqual(isAppError(error), false);
    });
  });
});
