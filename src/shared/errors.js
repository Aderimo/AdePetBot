/**
 * Typed application errors
 * Requirements: 17.5 (Standardized error responses), 25.2 (Error categorization)
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  /**
   * @param {string} code - Error code (e.g., 'MISSING_EVOLUTION_MATERIAL')
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {object} context - Additional error context
   */
  constructor(code, message, statusCode = 500, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to API response format
   * @returns {object} Error response object
   */
  toJSON() {
    return {
      error_code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message, context = {}) {
    super('VALIDATION_ERROR', message, 400, context);
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', context = {}) {
    super('AUTHENTICATION_ERROR', message, 401, context);
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions', context = {}) {
    super('AUTHORIZATION_ERROR', message, 403, context);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource, identifier, context = {}) {
    super(
      'NOT_FOUND',
      `${resource} not found: ${identifier}`,
      404,
      { resource, identifier, ...context }
    );
  }
}

/**
 * Conflict error (409) - for duplicate resources, race conditions
 */
export class ConflictError extends AppError {
  constructor(message, context = {}) {
    super('CONFLICT', message, 409, context);
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', context = {}) {
    super('RATE_LIMIT_EXCEEDED', message, 429, context);
  }
}

/**
 * Insufficient resources error (400) - for game-specific resource checks
 */
export class InsufficientResourcesError extends AppError {
  constructor(resource, required, available, context = {}) {
    super(
      'INSUFFICIENT_RESOURCES',
      `Insufficient ${resource}: required ${required}, available ${available}`,
      400,
      { resource, required, available, ...context }
    );
  }
}

/**
 * Inventory full error (400)
 */
export class InventoryFullError extends AppError {
  constructor(category, context = {}) {
    super(
      'INVENTORY_FULL',
      `${category} inventory is full`,
      400,
      { category, ...context }
    );
  }
}

/**
 * Missing prerequisite error (400) - for evolution, crafting, etc.
 */
export class MissingPrerequisiteError extends AppError {
  constructor(prerequisite, context = {}) {
    super(
      'MISSING_PREREQUISITE',
      `Missing prerequisite: ${prerequisite}`,
      400,
      { prerequisite, ...context }
    );
  }
}

/**
 * Invalid state error (400) - for pets that are locked, listed, defeated, etc.
 */
export class InvalidStateError extends AppError {
  constructor(resource, state, context = {}) {
    super(
      'INVALID_STATE',
      `${resource} is in invalid state: ${state}`,
      400,
      { resource, state, ...context }
    );
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message, context = {}) {
    super('DATABASE_ERROR', message, 500, context);
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service, message, context = {}) {
    super(
      'EXTERNAL_SERVICE_ERROR',
      `${service} error: ${message}`,
      502,
      { service, ...context }
    );
  }
}

/**
 * Check if error is an AppError
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is an AppError
 */
export function isAppError(error) {
  return error instanceof AppError;
}
