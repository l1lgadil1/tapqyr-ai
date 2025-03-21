import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Script to clean up duplicate assistant threads for users
 * This ensures each user has exactly one thread before applying the unique constraint
 */
async function cleanupDuplicateThreads() {
  try {
    logger.info('Starting duplicate thread cleanup...');
    
    // Get all users with assistant threads
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
      where: {
        assistantThreads: {
          some: {}
        }
      }
    });
    
    logger.info(`Found ${users.length} users with assistant threads`);
    
    let totalCleaned = 0;
    
    // For each user, find their threads and keep only the most recently used one
    for (const user of users) {
      const threads = await prisma.assistantThread.findMany({
        where: { userId: user.id },
        orderBy: { lastUsed: 'desc' }
      });
      
      if (threads.length <= 1) {
        logger.info(`User ${user.email} (${user.id}) has ${threads.length} thread(s), no cleanup needed`);
        continue;
      }
      
      // Keep the first thread (most recently used), delete the rest
      const [primaryThread, ...extraThreads] = threads;
      
      if (extraThreads.length > 0) {
        const extraThreadIds = extraThreads.map(thread => thread.id);
        
        await prisma.assistantThread.deleteMany({
          where: {
            id: { in: extraThreadIds }
          }
        });
        
        logger.info(`Cleaned up ${extraThreads.length} extra threads for user ${user.email} (${user.id}), kept ${primaryThread.threadId}`);
        totalCleaned += extraThreads.length;
      }
    }
    
    logger.info(`Cleanup complete! Removed ${totalCleaned} duplicate threads.`);
    return { success: true, totalCleaned };
  } catch (error) {
    logger.error(`Error cleaning up duplicate threads: ${(error as Error).message}`);
    return { success: false, error: (error as Error).message };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if this file is run directly
if (require.main === module) {
  cleanupDuplicateThreads()
    .then((result) => {
      console.log(result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { cleanupDuplicateThreads }; 