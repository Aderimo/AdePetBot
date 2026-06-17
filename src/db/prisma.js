import { PrismaClient } from '@prisma/client';
import config from '../shared/config.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__adePetBotPrisma ??
  new PrismaClient({
    log: config.isDevelopment ? ['warn', 'error'] : ['error'],
  });

if (!config.isProduction) {
  globalForPrisma.__adePetBotPrisma = prisma;
}

export default prisma;
