import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient();

/**
 * Interface for token payload
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Interface for token response
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate access token for a user
 * @param user User object
 * @returns JWT access token
 */
export const generateAccessToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    // Default role is 'user'
    role: 'user'
  };

  return jwt.sign(payload, config.jwt.accessTokenSecret, { expiresIn: '15m' });
};

/**
 * Generate refresh token for a user
 * @param user User object
 * @returns JWT refresh token
 */
export const generateRefreshToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    // Default role is 'user'
    role: 'user'
  };

  return jwt.sign(payload, config.jwt.refreshTokenSecret, { expiresIn: '7d' });
};

/**
 * Generate both access and refresh tokens for a user
 * @param user User object
 * @returns Object containing access token, refresh token, and expiry
 */
export const generateTokens = (user: User): TokenResponse => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 15 minutes in milliseconds
  const expiresIn = 15 * 60 * 1000;

  return {
    accessToken,
    refreshToken,
    expiresIn
  };
};

/**
 * Verify JWT token
 * @param token JWT token to verify
 * @param secret Secret used to sign the token
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string, secret: string): TokenPayload | null => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Verify access token
 * @param token JWT access token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  return verifyToken(token, config.jwt.accessTokenSecret);
};

/**
 * Verify refresh token
 * @param token JWT refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  return verifyToken(token, config.jwt.refreshTokenSecret);
};

/**
 * Blacklist a token
 */
export const blacklistToken = async (token: string, expiryTime: number): Promise<void> => {
  try {
    const expiresAt = new Date(Date.now() + expiryTime);
    
    await prisma.blacklistedToken.create({
      data: {
        token,
        expiresAt
      }
    });
    
    logger.info(`Token blacklisted successfully`);
  } catch (error) {
    logger.error(`Error blacklisting token: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Check if a token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const blacklistedToken = await prisma.blacklistedToken.findUnique({
      where: { token }
    });
    
    return !!blacklistedToken;
  } catch (error) {
    logger.error(`Error checking blacklisted token: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Clean up expired blacklisted tokens
 */
export const cleanupBlacklistedTokens = async (): Promise<void> => {
  try {
    const result = await prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    logger.info(`Cleaned up ${result.count} expired blacklisted tokens`);
  } catch (error) {
    logger.error(`Error cleaning up blacklisted tokens: ${(error as Error).message}`);
    throw error;
  }
}; 