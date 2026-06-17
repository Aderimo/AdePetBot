/**
 * Shared utilities index
 * Central export point for all shared infrastructure utilities
 */

// Config
export { config } from './config.js';

// Logger
export { logger } from './logger.js';

// Errors
export {
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
} from './errors.js';

// Random
export {
  randomFloat,
  randomInt,
  rollProbability,
  rollPercentage,
  randomChoice,
  weightedChoice,
  shuffle,
  randomUUID,
  randomHex,
} from './random.js';

// Cache
export { createCache, InMemoryCache } from './cache.js';

// Correlation
export {
  correlationMiddleware,
  getCorrelationId,
  createCorrelatedLogger,
} from './correlation.js';

// API Response
export {
  sendSuccess,
  sendError,
  errorHandler,
  asyncHandler,
} from './api-response.js';
