import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import openaiService from '../services/openai-service';
import logger from '../utils/logger';

/**
 * Generate a completion from OpenAI
 */
export async function generateCompletion(req: Request, res: Response): Promise<void> {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required and must be a string' });
      return;
    }

    // Generate completion
    const completion = await openaiService.generateCompletion(prompt);
    
    res.status(200).json({ completion });
  } catch (error) {
    logger.error(`Error in generateCompletion: ${(error as Error).message}`);
    res.status(500).json({ error: 'Failed to generate completion' });
  }
}

/**
 * Generate tasks from a prompt
 */
export async function generateTasks(req: Request, res: Response): Promise<void> {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required and must be a string' });
      return;
    }

    // Generate tasks
    const tasks = await openaiService.generateTasks(prompt);
    
    res.status(200).json({ tasks });
  } catch (error) {
    logger.error(`Error in generateTasks: ${(error as Error).message}`);
    res.status(500).json({ error: 'Failed to generate tasks' });
  }
} 