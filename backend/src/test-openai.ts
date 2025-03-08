import openaiService from './services/openai-service';
import logger from './utils/logger';

async function testOpenAI() {
  try {
    logger.info('Testing OpenAI service...');
    
    const prompt = 'Create a study plan for learning JavaScript';
    logger.info(`Using prompt: ${prompt}`);
    
    const tasks = await openaiService.generateTasks(prompt);
    logger.info(`Generated ${tasks.length} tasks`);
    logger.info(JSON.stringify(tasks, null, 2));
    
    logger.info('Test completed successfully');
  } catch (error) {
    logger.error(`Test failed: ${(error as Error).message}`);
    logger.error(error);
  }
}

testOpenAI(); 