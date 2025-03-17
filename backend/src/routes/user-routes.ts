import express from 'express';
import { 
  getUserById, 
  createUser, 
  updateUserContext, 
  getUserContext 
} from '../controllers/user-controller';

const router = express.Router();

// Get user by ID
router.get('/:id', getUserById);

// Create a new user
router.post('/', createUser);

// Update user context
router.patch('/:id/context', updateUserContext);

// Get user context
router.get('/:id/context', getUserContext);

export default router; 