/**
 * Express application setup.
 * Handles HTTP server, middleware, routes, and health checks.
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import config from '../shared/config.js';
import logger from '../shared/logger.js';
import { correlationMiddleware } from '../shared/correlation.js';
import { errorHandler } from '../shared/api-response.js';
import { NotFoundError } from '../shared/errors.js';
import apiRoutes from '../api/routes.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(correlationMiddleware());

  app.use((req, res, next) => {
    req.logger = logger.child(req.correlationId);
    next();
  });

  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      req.logger.info('HTTP request completed', {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs: Number(durationMs.toFixed(2)),
      });
    });

    next();
  });

  app.get('/', (req, res) => {
    res.json({
      name: 'AdePetBot',
      status: 'running',
      version: '0.1.0',
      endpoints: {
        health: '/health',
        api: '/api/v1',
      },
    });
  });

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use('/api/v1', apiRoutes);

  app.use((req, res, next) => {
    next(new NotFoundError('Endpoint', req.path));
  });

  app.use(errorHandler());

  return app;
}

export function startServer(app) {
  return new Promise((resolve, reject) => {
    const server = app.listen(config.web.port, (err) => {
      if (err) {
        reject(err);
      } else {
        logger.info(`HTTP server listening on port ${config.web.port}`);
        resolve(server);
      }
    });
  });
}
