import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '@prisma/client';
import config from '../config';
import logger from '../utils/logger';
import emailService from './email-service';
import prisma from '../utils/prisma';
import { generateTokens, verifyAccessToken, verifyRefreshToken, TokenPayload, TokenResponse, blacklistToken } from '../utils/token-utils';

class AuthService {
  private readonly saltRounds = 10;
  
  /**
   * Register a new user
   */
  async register(email: string, password: string, name?: string): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Create the user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          verificationToken
        }
      });
      
      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      logger.error(`Error in register: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Login a user
   */
  async login(email: string, password: string): Promise<{ user: User; tokens: TokenResponse }> {
    try {
      // Find the user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
      
      // Generate tokens
      const tokens = generateTokens(user);
      
      // Save refresh token to database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken }
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword as User,
        tokens
      };
    } catch (error) {
      logger.error(`Error in login: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Logout a user
   */
  async logout(userId: string, accessToken: string): Promise<void> {
    try {
      // Clear refresh token
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
      });
      
      // Blacklist the access token
      // The token will be blacklisted until its original expiry time
      const expiryTime = parseInt(config.jwt.accessTokenExpiry as string, 10);
      await blacklistToken(accessToken, expiryTime);
    } catch (error) {
      logger.error(`Error in logout: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);
      
      if (!payload) {
        throw new Error('Invalid refresh token');
      }
      
      // Find user with this refresh token
      const user = await prisma.user.findFirst({
        where: {
          id: payload.userId,
          refreshToken
        }
      });
      
      if (!user) {
        throw new Error('Invalid refresh token');
      }
      
      // Generate new tokens
      const tokens = generateTokens(user);
      
      // Save new refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken }
      });
      
      return tokens;
    } catch (error) {
      logger.error(`Error in refreshTokens: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<User> {
    try {
      // Find user with this verification token
      const user = await prisma.user.findFirst({
        where: { verificationToken: token }
      });
      
      if (!user) {
        throw new Error('Invalid verification token');
      }
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          verificationToken: null
        }
      });
      
      // Send welcome email
      await emailService.sendWelcomeEmail(updatedUser.email, updatedUser.name || '');
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword as User;
    } catch (error) {
      logger.error(`Error in verifyEmail: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        // Don't reveal that the user doesn't exist
        return;
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      
      // Save token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry
        }
      });
      
      // Send password reset email
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      logger.error(`Error in requestPasswordReset: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find user with this reset token and check if it's not expired
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date()
          }
        }
      });
      
      if (!user) {
        throw new Error('Invalid or expired password reset token');
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
      
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      });
    } catch (error) {
      logger.error(`Error in resetPassword: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
      
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
    } catch (error) {
      logger.error(`Error in changePassword: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return null;
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      logger.error(`Error in getUserById: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Validate token
   */
  validateToken(token: string): TokenPayload | null {
    return verifyAccessToken(token);
  }
}

export default new AuthService(); 