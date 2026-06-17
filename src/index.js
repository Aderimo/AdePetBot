/**
 * AdePetBot - Main entry point
 * Bootstraps Express server and Discord client with graceful shutdown
 */

import config from './shared/config.js';
import logger from './shared/logger.js';
import { createApp, startServer } from './app/server.js';
import { createDiscordClient, loginDiscordClient } from './bot/client.js';

// Global state
let httpServer = null;
let discordClient = null;

/**
 * Bootstrap application
 */
async function bootstrap() {
  try {
    logger.info('Starting AdePetBot...', {
      env: config.env,
      node_version: process.version,
    });

    // Create Express app
    const app = createApp();
    httpServer = await startServer(app);

    // Create and login Discord client
    discordClient = createDiscordClient();
    await loginDiscordClient(discordClient);

    // Report enabled integrations (Requirement 25.4)
    const integrations = {
      express: true,
      discord: true,
      database: !!config.database.url,
      redis: config.redis.enabled,
    };

    logger.info('AdePetBot started successfully', {
      integrations,
      port: config.web.port,
    });

  } catch (error) {
    logger.error('Failed to start application', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  try {
    // Close HTTP server
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server', { error: err.message });
            reject(err);
          } else {
            logger.info('HTTP server closed');
            resolve();
          }
        });
      });
    }

    // Destroy Discord client
    if (discordClient) {
      discordClient.destroy();
      logger.info('Discord client destroyed');
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  process.exit(1);
});

// Start application
bootstrap();
