import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import authService from '../services/auth-service';
import logger from '../utils/logger';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password, name } = req.body;
    
    // Register user
    const user = await authService.register(email, password, name);
    
    return res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    if ((error as Error).message === 'User with this email already exists') {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    logger.error(`Error in register: ${(error as Error).message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Login user
    const { user, tokens } = await authService.login(email, password);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });
    
    return res.status(200).json({
      message: 'Login successful',
      user,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn
    });
  } catch (error) {
    if ((error as Error).message === 'Invalid email or password') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    logger.error(`Error in login: ${(error as Error).message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Logout a user
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    
    // Logout user
    await authService.logout(userId, token);
    
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    logger.error(`Error in logout: ${(error as Error).message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Refresh tokens
 */
export const refreshTokens = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Refresh tokens
    const tokens = await authService.refreshTokens(refreshToken);
    
    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });
    
    return res.status(200).json({
      message: 'Tokens refreshed successfully',
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn
    });
  } catch (error) {
    if ((error as Error).message === 'Invalid refresh token') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    logger.error(`Error in refreshTokens: ${(error as Error).message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Verify email
    const user = await authService.verifyEmail(token);
    
    return res.status(200).json({
      message: 'Email verified successfully',
      user
    });
  } catch (error) {
    if ((error as Error).message === 'Invalid verification token') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    logger.error(`Error in verifyEmail: ${(error as Error).message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email } = req.body;
    
    // Request password reset
    await authService.requestPasswordReset(email);
    
    // Always return success to prevent email enumeration
    return res.status(200).json({
      message: 'If a user with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    logger.error(`Error in requestPasswordReset: ${(error as Error).message}`);
    // Still return success to prevent email enumeration
    return res.status(200).json({
      message: 'If a user with that email exists, a password reset link has been sent'
    });
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { token } = req.params;
    const { password } = req.body;
    
    // Reset password
    await authService.resetPassword(token, password);
    
    return res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    if ((error as Error).message === 'Invalid or expired password reset token') {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }
    
    logger.error(`Error in resetPassword: ${(error as Error).message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Get user ID from authenticated request
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Change password
    await authService.changePassword(userId, currentPassword, newPassword);
    
    return res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    if ((error as Error).message === 'Current password is incorrect') {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    logger.error(`Error in changePassword: ${(error as Error).message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get user
    const user = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ user });
  } catch (error) {
    logger.error(`Error in getCurrentUser: ${(error as Error).message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 