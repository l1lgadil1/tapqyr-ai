import { Request, Response, NextFunction } from 'express';
import config from '../config';
import logger from '../utils/logger';
import prisma from '../utils/prisma';
import { verifyAccessToken, TokenPayload } from '../utils/token-utils';
import { isTokenBlacklisted } from '../utils/token-utils';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error(`Authentication error: ${(error as Error).message}`);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't block the request if not
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return next();
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (user) {
      // Attach user to request
      req.user = decoded;
    }
  } catch (error) {
    // Just continue without attaching user
    logger.debug(`Optional authentication failed: ${(error as Error).message}`);
  }
  
  next();
}; 