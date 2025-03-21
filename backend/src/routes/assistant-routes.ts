import express from 'express';
import assistantController from '../controllers/assistant-controller';
import { authenticate } from '../middleware/auth-middleware';
import pendingCallService from '../services/pending-call-service';
import logger from '../utils/logger';

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
 * @route GET /api/assistant/chat-history
 * @desc Get chat history for a user
 * @access Private
 */
router.get(
  '/chat-history',
  authenticate,
  assistantController.getChatHistory
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

/**
 * @route POST /api/assistant/cleanup-threads/:userId
 * @desc Clean up extra threads for a user (admin function)
 * @access Private (would normally be Admin only)
 */
router.post(
  '/cleanup-threads/:userId',
  authenticate,
  assistantController.cleanupUserThreads
);

/**
 * @route GET /api/assistant/pending-calls
 * @desc Get all pending function calls that require user approval
 * @access Private
 */
router.get('/pending-calls', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID not found' });
    }
    
    const pendingCalls = await pendingCallService.getPendingCalls(userId);
    
    // Map the calls to include readable function arguments
    const formattedCalls = pendingCalls.map(call => ({
      ...call,
      formattedArgs: JSON.parse(call.functionArgs)
    }));
    
    res.json(formattedCalls);
  } catch (error) {
    logger.error(`Error fetching pending calls: ${(error as Error).message}`);
    res.status(500).json({ error: 'Failed to fetch pending calls' });
  }
});

/**
 * @route POST /api/assistant/pending-calls/:id/approve
 * @desc Approve a pending function call
 * @access Private
 */
router.post('/pending-calls/:id/approve', authenticate, (req, res) => {
  assistantController.executeApprovedCall(req, res);
});

/**
 * @route POST /api/assistant/pending-calls/:id/reject
 * @desc Reject a pending function call
 * @access Private
 */
router.post('/pending-calls/:id/reject', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID not found' });
    }
    
    const callId = req.params.id;
    
    // Update the call status to rejected
    await pendingCallService.updateCallStatus(callId, userId, 'rejected');
    
    res.json({ 
      success: true, 
      message: 'Function call rejected successfully' 
    });
  } catch (error) {
    logger.error(`Error rejecting function call: ${(error as Error).message}`);
    res.status(500).json({ error: 'Failed to reject function call' });
  }
});

export default router; 