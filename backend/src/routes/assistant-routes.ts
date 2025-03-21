import express from 'express';
import assistantController from '../controllers/assistant-controller';
import { authenticate } from '../middleware/auth-middleware';

const router = express.Router();

/**
 * @route POST /api/assistant/chat
 * @desc Send a message to the AI assistant
 * @access Private
 */
router.post(
  '/chat',
  authenticate,
  assistantController.validateChatMessage,
  assistantController.chatMessage
);

/**
 * @route POST /api/assistant/thread
 * @desc Create a new conversation thread
 * @access Private
 */
router.post(
  '/thread',
  authenticate,
  assistantController.createThread
);

/**
 * @route POST /api/assistant/generate-tasks
 * @desc Generate tasks based on a prompt
 * @access Private
 */
router.post(
  '/generate-tasks',
  authenticate,
  [
    // Additional validation could be added here
  ],
  assistantController.generateTasks
);

/**
 * @route GET /api/assistant/analyze-productivity
 * @desc Analyze user productivity
 * @access Private
 */
router.get(
  '/analyze-productivity',
  authenticate,
  assistantController.analyzeProductivity
);

export default router; 