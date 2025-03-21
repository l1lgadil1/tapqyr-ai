import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

class PendingCallService {
  /**
   * Create a new pending function call that requires user approval
   */
  async createPendingCall(
    userId: string,
    threadId: string,
    runId: string,
    toolCallId: string,
    functionName: string,
    functionArgs: string
  ) {
    try {
      const pendingCall = await prisma.pendingFunctionCall.create({
        data: {
          userId,
          threadId,
          runId,
          toolCallId,
          functionName,
          functionArgs,
          status: 'pending'
        }
      });
      
      logger.info(`Created pending function call ${pendingCall.id} for user ${userId}`);
      return pendingCall;
    } catch (error) {
      logger.error(`Error creating pending function call: ${(error as Error).message}`);
      throw new Error(`Failed to create pending function call: ${(error as Error).message}`);
    }
  }

  /**
   * Get all pending function calls for a user
   */
  async getPendingCalls(userId: string) {
    try {
      return await prisma.pendingFunctionCall.findMany({
        where: {
          userId,
          status: 'pending'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      logger.error(`Error getting pending function calls: ${(error as Error).message}`);
      throw new Error(`Failed to get pending function calls: ${(error as Error).message}`);
    }
  }

  /**
   * Update the status of a pending function call
   */
  async updateCallStatus(callId: string, userId: string, status: 'approved' | 'rejected') {
    try {
      // Verify the call belongs to the user
      const existingCall = await prisma.pendingFunctionCall.findFirst({
        where: {
          id: callId,
          userId
        }
      });
      
      if (!existingCall) {
        throw new Error(`Pending call not found or does not belong to user`);
      }
      
      // Update the status
      const updatedCall = await prisma.pendingFunctionCall.update({
        where: { id: callId },
        data: { status }
      });
      
      logger.info(`Updated pending function call ${callId} status to ${status}`);
      return updatedCall;
    } catch (error) {
      logger.error(`Error updating pending function call: ${(error as Error).message}`);
      throw new Error(`Failed to update pending function call: ${(error as Error).message}`);
    }
  }

  /**
   * Get a specific pending function call by ID
   */
  async getPendingCallById(callId: string, userId: string) {
    try {
      const call = await prisma.pendingFunctionCall.findFirst({
        where: {
          id: callId,
          userId
        }
      });
      
      if (!call) {
        throw new Error(`Pending call not found or does not belong to user`);
      }
      
      return call;
    } catch (error) {
      logger.error(`Error getting pending function call: ${(error as Error).message}`);
      throw new Error(`Failed to get pending function call: ${(error as Error).message}`);
    }
  }
}

export default new PendingCallService(); 