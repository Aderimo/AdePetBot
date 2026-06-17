/**
 * Correlation ID middleware and utilities
 * Requirements: 25.4 (Correlation IDs for request tracking)
 */

import { randomUUID } from './random.js';

/**
 * Express middleware to add correlation ID to requests
 * Checks for existing X-Correlation-ID header or generates a new one
 * @returns {Function} Express middleware
 */
export function correlationMiddleware() {
  return (req, res, next) => {
    // Check if correlation ID already exists in headers
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    
    // Attach to request object
    req.correlationId = correlationId;
    
    // Add to response headers
    res.setHeader('X-Correlation-ID', correlationId);
    
    next();
  };
}

/**
 * Get correlation ID from request
 * @param {object} req - Express request object
 * @returns {string} Correlation ID
 */
export function getCorrelationId(req) {
  return req.correlationId || 'unknown';
}

/**
 * Create a logger with correlation ID
 * @param {object} logger - Base logger instance
 * @param {string} correlationId - Correlation ID
 * @returns {object} Logger with correlation ID
 */
export function createCorrelatedLogger(logger, correlationId) {
  return logger.child(correlationId);
}

export default {
  correlationMiddleware,
  getCorrelationId,
  createCorrelatedLogger,
};
