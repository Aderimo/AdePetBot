/**
 * Shared configuration loader
 * Validates and exports environment variables.
 */

import dotenv from 'dotenv';

dotenv.config();

function readPort() {
  return parseInt(process.env.PORT || process.env.WEB_PORT || '3000', 10);
}

/**
 * Validates required environment variables.
 * @throws {Error} if required variables are missing
 */
function validateEnv() {
  const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const port = readPort();
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT/WEB_PORT must be a valid port number (1-65535)');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'change-this-in-production') {
      throw new Error('SESSION_SECRET must be set in production');
    }
    if (!process.env.REDIS_URL) {
      console.warn('WARNING: REDIS_URL not set in production. Using in-memory cache fallback.');
    }
  }
}

validateEnv();

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  web: {
    port: readPort(),
    baseUrl: process.env.WEB_BASE_URL || 'http://localhost:3000',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    ttl: parseInt(process.env.SESSION_TTL || '86400', 10),
  },

  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.LOG_PRETTY === 'true' || process.env.NODE_ENV !== 'production',
  },

  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
