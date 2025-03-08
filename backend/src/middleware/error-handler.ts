import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack || '');
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

/**
 * Not found middleware
 */
export function notFound(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
} 