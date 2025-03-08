import { Router } from 'express';
import { body } from 'express-validator';
import * as openaiController from '../controllers/openai-controller';

const router = Router();

/**
 * @route POST /api/openai/completion
 * @desc Generate a completion from OpenAI
 * @access Public
 */
router.post(
  '/completion',
  [
    body('prompt')
      .notEmpty()
      .withMessage('Prompt is required')
      .isString()
      .withMessage('Prompt must be a string')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Prompt must be between 3 and 1000 characters'),
  ],
  openaiController.generateCompletion
);

/**
 * @route POST /api/openai/tasks
 * @desc Generate tasks from a prompt
 * @access Public
 */
router.post(
  '/tasks',
  [
    body('prompt')
      .notEmpty()
      .withMessage('Prompt is required')
      .isString()
      .withMessage('Prompt must be a string')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Prompt must be between 3 and 1000 characters'),
  ],
  openaiController.generateTasks
);

export default router; 