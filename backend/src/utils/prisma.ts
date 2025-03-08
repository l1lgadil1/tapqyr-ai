import { PrismaClient } from '@prisma/client';
import logger from './logger';

/**
 * Singleton instance of PrismaClient to be used throughout the application
 * This prevents creating multiple instances of PrismaClient which can lead to exceeding connection limits
 */
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log queries in development mode
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
  
  prisma.$on('error', (e) => {
    logger.error(`Prisma Error: ${e.message}`);
  });
}

export default prisma; 