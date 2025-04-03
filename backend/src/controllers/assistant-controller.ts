import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import assistantService from '../services/assistant-service';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  ];

  /**
   * Extract text content from assistant response
   */
  private extractTextFromResponse(response: any): string {
    if (!response || !response.content) {
      return '';
    }

    return response.content
      .filter((content: any) => content.type === 'text')
      .map((content: any) => content.text.value)
      .join('\n');
  }

  /**
   * Handle chat message request
   * Automatically manages the thread on the server side, sends message to assistant, and returns response
   */
  async chatMessage(req: Request, res: Response) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized - User ID not found' });
      }

      logger.info(`Processing chat message for user ${userId}`);

      // Get or create thread for this user (managed server-side)
      const threadId = await assistantService.getOrCreateThreadForUser(userId);

      // Send message to assistant
      const response = await assistantService.sendMessage(userId, threadId, message);

      // Return response
      return res.status(200).json({
        message: response.content[0]?.text?.value || '',
        response
      });

    } catch (error) {
      logger.error(`Error processing message: ${(error as Error).message}`);
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
      
      // Create a new thread using the assistant service
      const threadId = await assistantService.createThread(userId);
      
      return res.status(200).json({
        threadId,
        message: 'Thread created successfully'
      });
    } catch (error) {
      logger.error(`Error in create thread: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to create thread',
        error: (error as Error).message
      });
    }
  }

  /**
   * Generate tasks based on user prompt
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
      
      logger.info(`Generating tasks for user ${userId}`);
      
      // Get or create thread for this user
      const threadId = await assistantService.getOrCreateThreadForUser(userId);
      
      // Generate tasks using AI assistant
      await assistantService.sendMessage(userId, threadId, 
        `Based on the following description, please create appropriate tasks for me: ${prompt}. 
         Create the tasks using the create_task function.`
      );
      
      return res.status(200).json({
        message: 'Tasks are being generated. They will appear in your task list shortly.'
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
      
      logger.info(`Analyzing productivity for user ${userId}`);
      
      // Get or create thread for this user
      const threadId = await assistantService.getOrCreateThreadForUser(userId);
      
      // Get productivity data
      const data = await assistantService.analyzeProductivity(userId);
      
      // Send a message to the assistant to analyze the data
      await assistantService.sendMessage(userId, threadId, 
        `Please analyze my productivity based on the following data: ${JSON.stringify(data)}. 
         Provide insights and recommendations based on this data.`
      );
      
      // Extract the analysis message
      const analysis = `Here's an analysis of your productivity over the past ${data.period.days} days:
      
Tasks completed: ${data.overview.completedTasks} out of ${data.overview.totalTasks} (${data.overview.completionRate}%).
Overdue tasks: ${data.overview.overdueTasks}
Average task completion time: ${data.overview.averageTaskAgeInDays} days

Key insights:
- ${data.recommendations[0] || 'No recommendations available'}
${data.recommendations[1] ? `- ${data.recommendations[1]}` : ''}
${data.recommendations[2] ? `- ${data.recommendations[2]}` : ''}`;
      
      return res.status(200).json({
        message: 'Productivity analysis complete',
        analysis: analysis
      });
      
    } catch (error) {
      logger.error(`Error analyzing productivity: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to analyze productivity',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized - User ID not found' });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      
      // Get thread for user
      const threadId = await assistantService.getOrCreateThreadForUser(userId);
      
      logger.info(`Getting chat history for user ${userId}`);
      
      // Get chat history
      const chatHistory = await assistantService.getChatHistory(userId, threadId, limit);

      return res.status(200).json({
        threadId,
        messages: chatHistory
      });
    } catch (error) {
      logger.error(`Error getting chat history: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to get chat history',
        error: (error as Error).message
      });
    }
  }

  /**
   * Clean up extra threads for a user (keeping only the primary one)
   * This is an admin/maintenance function and should be called carefully
   */
  async cleanupUserThreads(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Admin check would go here in a real application
      
      logger.info(`Cleaning up threads for user ${userId}`);
      
      // Get all threads for the user
      const threads = await prisma.assistantThread.findMany({
        where: { userId },
        orderBy: { lastUsed: 'desc' }
      });
      
      if (threads.length <= 1) {
        return res.status(200).json({
          message: 'User has 0 or 1 threads, no cleanup needed',
          threadsCount: threads.length
        });
      }
      
      // Keep the most recently used thread, delete the rest
      const [primaryThread, ...extraThreads] = threads;
      
      // Delete the extra threads
      const extraThreadIds = extraThreads.map(thread => thread.id);
      await prisma.assistantThread.deleteMany({
        where: {
          id: { in: extraThreadIds }
        }
      });
      
      return res.status(200).json({
        message: 'Successfully cleaned up extra threads',
        keptThreadId: primaryThread.threadId,
        deletedCount: extraThreads.length
      });
    } catch (error) {
      logger.error(`Error cleaning up threads: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to clean up threads',
        error: (error as Error).message
      });
    }
  }

  /**
   * Execute an approved function call
   */
  async executeApprovedCall(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized - User ID not found' });
      }

      const { id } = req.params;
      
      // Execute the approved call
      const result = await assistantService.executeApprovedCall(userId, id);
      
      return res.status(200).json({
        success: true,
        message: 'Function call executed successfully',
        result
      });
    } catch (error) {
      logger.error(`Error executing approved call: ${(error as Error).message}`);
      return res.status(500).json({
        message: 'Failed to execute approved call',
        error: (error as Error).message
      });
    }
  }
}

export default new AssistantController(); 