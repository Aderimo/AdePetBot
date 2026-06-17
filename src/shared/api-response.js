/**
 * Standardized API response helpers
 * Requirements: 17.5 (Standardized error responses)
 */

import { isAppError } from './errors.js';
import logger from './logger.js';

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json(data);
}

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {Error} error - Error object
 * @param {object} req - Express request object (for correlation ID)
 */
export function sendError(res, error, req = null) {
  const correlationId = req?.correlationId;
  
  // Handle known application errors
  if (isAppError(error)) {
    const response = error.toJSON();
    
    // Log error with correlation ID
    logger.error(error.message, {
      correlationId,
      errorCode: error.code,
      statusCode: error.statusCode,
      context: error.context,
      stack: error.stack,
    });
    
    return res.status(error.statusCode).json(response);
  }
  
  // Handle unknown errors
  logger.error('Unhandled error', {
    correlationId,
    error: error.message,
    stack: error.stack,
  });
  
  // Don't expose internal error details in production
  const response = {
    error_code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    context: {},
  };
  
  // Add correlation ID if available
  if (correlationId) {
    response.context.correlationId = correlationId;
  }
  
  res.status(500).json(response);
}

/**
 * Express error handler middleware
 * Should be added after all routes
 * @returns {Function} Express error middleware
 */
export function errorHandler() {
  return (err, req, res, next) => {
    sendError(res, err, req);
  };
}

/**
 * Async route wrapper to catch errors
 * Wraps async route handlers to automatically catch and forward errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped route handler
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default {
  sendSuccess,
  sendError,
  errorHandler,
  asyncHandler,
};
