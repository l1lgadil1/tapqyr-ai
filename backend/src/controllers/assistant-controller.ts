import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import assistantService from '../services/assistant-service';
import logger from '../utils/logger';

/**
 * Assistant controller for handling AI assistant related endpoints
 */
class AssistantController {
  /**
   * Validation rules for the chat message endpoint
   */
  validateChatMessage = [
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isString()
      .withMessage('Message must be a string'),
    body('threadId')
      .optional()
      .isString()
      .withMessage('Thread ID must be a string if provided'),
  ];

  /**
   * Handle chat message request
   * Creates a new thread if none provided, sends message to assistant, and returns response
   */
  async chatMessage(req: Request, res: Response) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message, threadId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized - User ID not found' });
      }

      logger.info(`Processing chat message for user ${userId}`);

      // Get or create thread ID
      const actualThreadId = threadId || await assistantService.getOrCreateThreadForUser(userId);

      // Send message to assistant
      const response = await assistantService.sendMessage(userId, actualThreadId, message);

      // Extract content from response
      const content = response.content.map((item: any) => {
        if (item.type === 'text') {
          return item.text.value;
        }
        return null;
      }).filter(Boolean).join('\n');

      return res.status(200).json({
        threadId: actualThreadId,
        message: content,
        response
      });
    } catch (error) {
      logger.error(`Error in chat message: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to process message',
        error: (error as Error).message
      });
    }
  }

  /**
   * Create a new thread for a user
   */
  async createThread(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized - User ID not found' });
      }

      logger.info(`Creating new thread for user ${userId}`);

      const threadId = await assistantService.createThread(userId);

      return res.status(200).json({
        threadId,
        message: 'Thread created successfully'
      });
    } catch (error) {
      logger.error(`Error creating thread: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to create thread',
        error: (error as Error).message
      });
    }
  }

  /**
   * Generate tasks based on a user prompt
   * This is a simplified version - in a real implementation you would use 
   * the assistant to generate the tasks directly
   */
  async generateTasks(req: Request, res: Response) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { prompt } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized - User ID not found' });
      }

      logger.info(`Generating tasks for user ${userId} with prompt: ${prompt}`);

      // Get or create thread ID for the user
      const threadId = await assistantService.getOrCreateThreadForUser(userId);

      // Send specific message to assistant to generate tasks
      const message = `Please generate tasks based on this prompt: ${prompt}. Use the create_task function for each task you generate.`;
      
      await assistantService.sendMessage(userId, threadId, message);

      // Get the tasks that were created (they will be created by the assistant via function calling)
      return res.status(200).json({
        message: 'Tasks generated successfully',
        // Note: The tasks themselves are created directly via the function calls
      });
    } catch (error) {
      logger.error(`Error generating tasks: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to generate tasks',
        error: (error as Error).message
      });
    }
  }

  /**
   * Analyze user productivity 
   */
  async analyzeProductivity(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized - User ID not found' });
      }

      const { startDate, endDate } = req.query;

      logger.info(`Analyzing productivity for user ${userId}`);

      // Get or create thread ID for the user
      const threadId = await assistantService.getOrCreateThreadForUser(userId);

      // Send specific message to assistant to analyze productivity
      const message = 'Please analyze my productivity and provide recommendations.';
      
      const response = await assistantService.sendMessage(userId, threadId, message);

      // Extract content from response
      const content = response.content.map((item: any) => {
        if (item.type === 'text') {
          return item.text.value;
        }
        return null;
      }).filter(Boolean).join('\n');

      return res.status(200).json({
        analysis: content,
        message: 'Productivity analyzed successfully'
      });
    } catch (error) {
      logger.error(`Error analyzing productivity: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to analyze productivity',
        error: (error as Error).message
      });
    }
  }
}

export default new AssistantController(); 