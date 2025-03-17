import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';
import prisma from '../utils/prisma';

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        workDescription: true,
        shortTermGoals: true,
        longTermGoals: true,
        otherContext: true,
        onboardingComplete: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error('Error getting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return res.status(201).json(user);
  } catch (error) {
    logger.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user context
 */
export const updateUserContext = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workDescription, shortTermGoals, longTermGoals, otherContext, onboardingComplete } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user context
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        workDescription,
        shortTermGoals,
        longTermGoals,
        otherContext,
        onboardingComplete,
      },
      select: {
        id: true,
        email: true,
        name: true,
        workDescription: true,
        shortTermGoals: true,
        longTermGoals: true,
        otherContext: true,
        onboardingComplete: true,
      }
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    logger.error('Error updating user context:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user context
 */
export const getUserContext = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        workDescription: true,
        shortTermGoals: true,
        longTermGoals: true,
        otherContext: true,
        onboardingComplete: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error('Error getting user context:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 