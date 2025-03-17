import { Router } from 'express';
import { body, param } from 'express-validator';
import * as authController from '../controllers/auth-controller';
import { authenticate } from '../middleware/auth-middleware';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .optional()
      .isString()
      .withMessage('Name must be a string')
      .trim()
  ],
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  authController.login
);

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route POST /api/auth/refresh-tokens
 * @desc Refresh access and refresh tokens
 * @access Public
 */
router.post('/refresh-tokens', authController.refreshTokens);

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Verify email address
 * @access Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route POST /api/auth/request-password-reset
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/request-password-reset',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  authController.requestPasswordReset
);

/**
 * @route POST /api/auth/reset-password/:token
 * @desc Reset password
 * @access Public
 */
router.post(
  '/reset-password/:token',
  [
    param('token')
      .notEmpty()
      .withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  authController.resetPassword
);

/**
 * @route POST /api/auth/change-password
 * @desc Change password
 * @access Private
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  authController.changePassword
);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router; 