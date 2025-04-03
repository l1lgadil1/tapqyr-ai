import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import config from '../config';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

async function cleanupMockThreads() {
  try {
    logger.info('Starting mock threads cleanup...');

    // Find all mock threads
    const mockThreads = await prisma.assistantThread.findMany({
      where: {
        threadId: {
          startsWith: 'mock-thread-'
        }
      },
      include: {
        user: true
      }
    });

    logger.info(`Found ${mockThreads.length} mock threads to clean up`);

    // Process each mock thread
    for (const mockThread of mockThreads) {
      try {
        logger.info(`Processing mock thread ${mockThread.threadId} for user ${mockThread.userId}`);

        // Create a new real OpenAI thread
        const newThread = await openai.beta.threads.create();
        
        // Update the thread ID in the database
        await prisma.assistantThread.update({
          where: { id: mockThread.id },
          data: {
            threadId: newThread.id,
          }
        });

        logger.info(`Successfully replaced mock thread with real thread ${newThread.id}`);
      } catch (error) {
        logger.error(`Error processing thread ${mockThread.threadId}: ${(error as Error).message}`);
      }
    }

    logger.info('Mock threads cleanup completed');
  } catch (error) {
    logger.error(`Error during cleanup: ${(error as Error).message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupMockThreads(); 