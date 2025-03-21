import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Service for managing user memory for the AI assistant
 */
class MemoryService {
  /**
   * Get or create user memory
   */
  async getOrCreateUserMemory(userId: string) {
    try {
      // Find existing memory
      const existingMemory = await prisma.userMemory.findUnique({
        where: { userId }
      });

      // If found, return it
      if (existingMemory) {
        return existingMemory;
      }

      // If not found, create new memory
      return await prisma.userMemory.create({
        data: {
          userId,
          taskPreferences: {},
          workPatterns: {},
          interactionHistory: {},
          userPersona: {}
        }
      });
    } catch (error) {
      logger.error(`Error getting/creating user memory: ${(error as Error).message}`);
      throw new Error(`Failed to get/create user memory: ${(error as Error).message}`);
    }
  }

  /**
   * Update user memory 
   */
  async updateUserMemory(userId: string, updates: any) {
    try {
      // Get existing memory or create new
      await this.getOrCreateUserMemory(userId);

      // Update the memory
      return await prisma.userMemory.update({
        where: { userId },
        data: updates
      });
    } catch (error) {
      logger.error(`Error updating user memory: ${(error as Error).message}`);
      throw new Error(`Failed to update user memory: ${(error as Error).message}`);
    }
  }

  /**
   * Update specific memory field
   */
  async updateMemoryField(userId: string, field: string, value: any) {
    try {
      // Get memory
      const memory = await this.getOrCreateUserMemory(userId);
      
      // Create update object
      const updates: Record<string, any> = {};
      updates[field] = value;
      
      // Update the field
      return await prisma.userMemory.update({
        where: { userId },
        data: updates
      });
    } catch (error) {
      logger.error(`Error updating memory field: ${(error as Error).message}`);
      throw new Error(`Failed to update memory field: ${(error as Error).message}`);
    }
  }

  /**
   * Update text memory by appending new information
   */
  async appendToMemoryText(userId: string, text: string) {
    try {
      // Get existing memory
      const memory = await this.getOrCreateUserMemory(userId);
      
      // Append to existing memory text or create new
      const updatedText = memory.memoryText 
        ? `${memory.memoryText}\n\n${new Date().toISOString()}: ${text}`
        : `${new Date().toISOString()}: ${text}`;
      
      // Update memory
      return await prisma.userMemory.update({
        where: { userId },
        data: { memoryText: updatedText }
      });
    } catch (error) {
      logger.error(`Error appending to memory text: ${(error as Error).message}`);
      throw new Error(`Failed to append to memory text: ${(error as Error).message}`);
    }
  }

  /**
   * Record a user action to build memory
   */
  async recordUserAction(userId: string, action: string, details: any) {
    try {
      // Get existing memory
      const memory = await this.getOrCreateUserMemory(userId);
      
      // Get existing interaction history or initialize
      const history = memory.interactionHistory as any || {};
      
      // Add action to history
      const timestamp = new Date().toISOString();
      
      if (!history.actions) {
        history.actions = [];
      }
      
      // Add action while maintaining a reasonable size (last 50 actions)
      history.actions = [
        { timestamp, action, details },
        ...history.actions.slice(0, 49)
      ];
      
      // Update memory
      return await prisma.userMemory.update({
        where: { userId },
        data: { interactionHistory: history }
      });
    } catch (error) {
      logger.error(`Error recording user action: ${(error as Error).message}`);
      throw new Error(`Failed to record user action: ${(error as Error).message}`);
    }
  }

  /**
   * Generate a context string for the assistant based on user's memory
   */
  async generateAssistantContext(userId: string): Promise<string> {
    try {
      // Get user data
      const [user, memory] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            workDescription: true,
            shortTermGoals: true,
            longTermGoals: true,
            otherContext: true
          }
        }),
        this.getOrCreateUserMemory(userId)
      ]);

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Get recent tasks
      const recentTasks = await prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Generate context sections
      const sections = [];

      // Add user profile information
      sections.push('## User Profile');
      if (user.name) sections.push(`Name: ${user.name}`);
      if (user.workDescription) sections.push(`Work: ${user.workDescription}`);
      if (user.shortTermGoals) sections.push(`Short-term goals: ${user.shortTermGoals}`);
      if (user.longTermGoals) sections.push(`Long-term goals: ${user.longTermGoals}`);
      if (user.otherContext) sections.push(`Other context: ${user.otherContext}`);

      // Add recent tasks
      sections.push('\n## Recent Tasks');
      recentTasks.forEach(task => {
        sections.push(`- ${task.title} (${task.priority} priority, ${task.completed ? 'completed' : 'active'})`);
      });

      // Add learned preferences if available
      if (memory.taskPreferences && Object.keys(memory.taskPreferences as any).length > 0) {
        sections.push('\n## Learned Task Preferences');
        
        const preferences = memory.taskPreferences as any;
        Object.entries(preferences).forEach(([key, value]) => {
          sections.push(`- ${key}: ${JSON.stringify(value)}`);
        });
      }

      // Add work patterns if available
      if (memory.workPatterns && Object.keys(memory.workPatterns as any).length > 0) {
        sections.push('\n## Observed Work Patterns');
        
        const patterns = memory.workPatterns as any;
        Object.entries(patterns).forEach(([key, value]) => {
          sections.push(`- ${key}: ${JSON.stringify(value)}`);
        });
      }

      // Add key memories if available
      if (memory.memoryText) {
        sections.push('\n## Key Memories');
        // Only use the most recent memories (last 1000 characters)
        const truncatedMemory = memory.memoryText.length > 1000 
          ? `...\n${memory.memoryText.slice(-1000)}`
          : memory.memoryText;
        sections.push(truncatedMemory);
      }

      // Combine all sections
      return sections.join('\n');
    } catch (error) {
      logger.error(`Error generating assistant context: ${(error as Error).message}`);
      return ''; // Return empty string on error rather than failing
    }
  }
}

export default new MemoryService(); 