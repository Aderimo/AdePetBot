/**
 * Structured JSON logger with correlation ID support
 * Requirements: 25.1 (Structured logging), 25.4 (Correlation IDs)
 */

import config from './config.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS[config.logging.level] ?? LOG_LEVELS.info;
    this.pretty = config.logging.pretty;
  }

  /**
   * Format log entry with correlation ID support
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   * @returns {string} Formatted log entry
   */
  _format(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };

    // Add correlation ID if present
    if (meta.correlationId) {
      entry.correlationId = meta.correlationId;
    }

    // Add error stack trace if present
    if (meta.error instanceof Error) {
      entry.error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      };
      delete entry.error; // Remove the Error object itself
      entry.errorName = meta.error.name;
      entry.errorMessage = meta.error.message;
      entry.errorStack = meta.error.stack;
    }

    if (this.pretty) {
      // Pretty print for development
      const correlationStr = entry.correlationId ? ` [${entry.correlationId}]` : '';
      const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      return `[${entry.timestamp}]${correlationStr} ${level.toUpperCase()}: ${message}${metaStr}`;
    }

    // JSON for production
    return JSON.stringify(entry);
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {object} meta - Additional metadata (can include error, correlationId, playerId, etc.)
   */
  error(message, meta = {}) {
    if (this.level >= LOG_LEVELS.error) {
      console.error(this._format('error', message, meta));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    if (this.level >= LOG_LEVELS.warn) {
      console.warn(this._format('warn', message, meta));
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {object} meta - Additional metadata
   */
  info(message, meta = {}) {
    if (this.level >= LOG_LEVELS.info) {
      console.log(this._format('info', message, meta));
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (this.level >= LOG_LEVELS.debug) {
      console.log(this._format('debug', message, meta));
    }
  }

  /**
   * Create a child logger with a correlation ID
   * @param {string} correlationId - Correlation ID for request tracking
   * @returns {Logger} Child logger with correlation ID
   */
  child(correlationId) {
    const childLogger = Object.create(this);
    childLogger.correlationId = correlationId;
    
    // Override format to include correlation ID
    const originalFormat = this._format.bind(this);
    childLogger._format = (level, message, meta = {}) => {
      return originalFormat(level, message, { ...meta, correlationId });
    };
    
    return childLogger;
  }
}

export const logger = new Logger();
export default logger;
