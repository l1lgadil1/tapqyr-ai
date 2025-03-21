import { OpenAI } from 'openai';
import { PrismaClient, Todo } from '@prisma/client';
import config from '../config';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Define the types for function parameters
interface CreateTaskParams {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

interface UpdateTaskParams {
  taskId: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed?: boolean;
}

interface DeleteTaskParams {
  taskId: string;
}

interface GetTasksParams {
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  dueBefore?: string;
  dueAfter?: string;
}

interface AnalyzeProductivityParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Class for handling OpenAI Assistant functionality
 */
class AssistantService {
  private assistantId: string;

  constructor() {
    this.assistantId = config.openai.assistantId;
    if (!this.assistantId) {
      logger.warn('OpenAI Assistant ID is not configured. Using fallback implementation.');
      // We'll continue without throwing an error and use mock responses
    }
  }

  /**
   * Create a new thread for a user
   */
  async createThread(userId: string): Promise<string> {
    try {
      logger.info(`Creating new thread for user ${userId}`);
      
      // If no assistant ID is configured, use a mock thread ID
      if (!this.assistantId) {
        const mockThreadId = `mock-thread-${Date.now()}-${userId}`;
        logger.info(`Created mock thread with ID: ${mockThreadId}`);
        return mockThreadId;
      }
      
      const thread = await openai.beta.threads.create();
      logger.info(`Thread created with ID: ${thread.id}`);
      return thread.id;
    } catch (error) {
      logger.error(`Error creating thread: ${(error as Error).message}`);
      throw new Error(`Failed to create conversation thread: ${(error as Error).message}`);
    }
  }

  /**
   * Get or create a thread for a user
   */
  async getOrCreateThreadForUser(userId: string): Promise<string> {
    try {
      // Check if user has thread ID stored in their profile or in a separate table
      // This is a simplification - you would typically store this in a database
      // For now, we'll just create a new thread each time
      return await this.createThread(userId);
    } catch (error) {
      logger.error(`Error getting or creating thread: ${(error as Error).message}`);
      throw new Error(`Failed to get or create thread: ${(error as Error).message}`);
    }
  }

  /**
   * Send a message to the assistant and get a response
   */
  async sendMessage(userId: string, threadId: string, message: string): Promise<any> {
    try {
      logger.info(`Sending message to thread ${threadId} for user ${userId}`);
      
      // If no assistant ID is configured, use mock responses
      if (!this.assistantId) {
        logger.info('Using mock implementation for the assistant');
        return this.mockSendMessage(userId, message);
      }
      
      // Add the user message to the thread
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message,
      });
      
      // Run the assistant on the thread
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
      });
      
      // Wait for the run to complete
      const completedRun = await this.waitForRunCompletion(threadId, run.id);
      
      // Check if there are any required actions (function calls)
      if (completedRun.status === 'requires_action' && 
          completedRun.required_action?.type === 'submit_tool_outputs') {
        
        // Handle function calls
        const toolCalls = completedRun.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = await this.processFunctionCalls(userId, toolCalls);
        
        // Submit the tool outputs
        await openai.beta.threads.runs.submitToolOutputs(
          threadId,
          completedRun.id,
          { tool_outputs: toolOutputs }
        );
        
        // Wait for the run to complete again
        await this.waitForRunCompletion(threadId, completedRun.id);
      }
      
      // Get the latest messages
      const messages = await openai.beta.threads.messages.list(threadId);
      
      // Return the assistant's response
      const assistantMessages = messages.data
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      if (assistantMessages.length === 0) {
        throw new Error('No response from assistant');
      }
      
      return assistantMessages[0];
    } catch (error) {
      logger.error(`Error sending message: ${(error as Error).message}`);
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  }

  /**
   * Mock implementation of sendMessage for when the OpenAI Assistant is not configured
   */
  private mockSendMessage(userId: string, message: string): any {
    // Create a simulated message object that matches the structure expected by the frontend
    const now = new Date();
    
    // Analyze the message to determine an appropriate response
    let responseContent = "";
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      responseContent = "Hello! I'm your AI Assistant. How can I help you with your tasks today?";
    } else if (message.toLowerCase().includes('task') && (message.toLowerCase().includes('create') || message.toLowerCase().includes('add'))) {
      responseContent = "I've created a new task for you. You can view it in your task list.";
      // Simulate creating a task
      this.createTask(userId, { title: message.replace(/create|add|task/gi, '').trim() || "New Task" }).catch(err => {
        logger.error(`Error creating mock task: ${err.message}`);
      });
    } else if (message.toLowerCase().includes('productivity')) {
      responseContent = "Based on my analysis, your productivity has been good. You've completed 70% of your tasks this week. Keep up the good work!";
    } else {
      responseContent = "I understand your request. Is there anything specific you'd like me to help you with regarding your tasks or productivity?";
    }
    
    return {
      id: `mock-${Date.now()}`,
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: {
            value: responseContent
          }
        }
      ],
      created_at: now.getTime() / 1000
    };
  }

  /**
   * Wait for a run to complete
   */
  private async waitForRunCompletion(threadId: string, runId: string, maxRetries = 10): Promise<any> {
    let retries = 0;
    
    while (retries < maxRetries) {
      const run = await openai.beta.threads.runs.retrieve(threadId, runId);
      
      if (run.status === 'completed' || 
          run.status === 'failed' || 
          run.status === 'requires_action') {
        return run;
      }
      
      if (run.status === 'expired' || run.status === 'cancelled') {
        throw new Error(`Run ${runId} ${run.status}`);
      }
      
      // Delay before checking again (exponential backoff)
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
    
    throw new Error('Run timed out');
  }

  /**
   * Process function calls from the assistant
   */
  private async processFunctionCalls(userId: string, toolCalls: any[]): Promise<any[]> {
    const toolOutputs = [];
    
    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionArgs = JSON.parse(tool.function.arguments);
      
      try {
        let result;
        
        switch (functionName) {
          case 'create_task':
            result = await this.createTask(userId, functionArgs);
            break;
          case 'update_task':
            result = await this.updateTask(userId, functionArgs);
            break;
          case 'delete_task':
            result = await this.deleteTask(userId, functionArgs);
            break;
          case 'get_tasks':
            result = await this.getTasks(userId, functionArgs);
            break;
          case 'analyze_productivity':
            result = await this.analyzeProductivity(userId, functionArgs);
            break;
          default:
            throw new Error(`Unknown function: ${functionName}`);
        }
        
        toolOutputs.push({
          tool_call_id: tool.id,
          output: JSON.stringify(result),
        });
        
      } catch (error) {
        toolOutputs.push({
          tool_call_id: tool.id,
          output: JSON.stringify({ error: (error as Error).message }),
        });
      }
    }
    
    return toolOutputs;
  }

  /**
   * Create a task for a user
   */
  private async createTask(userId: string, params: CreateTaskParams): Promise<Todo> {
    try {
      logger.info(`Creating task for user ${userId}: ${params.title}`);

      // Parse date string to Date object if present
      let dueDate = undefined;
      if (params.dueDate) {
        dueDate = new Date(params.dueDate);
      }

      // Create the task in the database
      const task = await prisma.todo.create({
        data: {
          title: params.title,
          description: params.description || null,
          priority: params.priority || 'medium',
          dueDate: dueDate,
          userId: userId,
          isAIGenerated: true
        }
      });

      logger.info(`Task created with ID: ${task.id}`);
      return task;
    } catch (error) {
      logger.error(`Error creating task: ${(error as Error).message}`);
      throw new Error(`Failed to create task: ${(error as Error).message}`);
    }
  }

  /**
   * Update a task for a user
   */
  private async updateTask(userId: string, params: UpdateTaskParams): Promise<Todo> {
    try {
      logger.info(`Updating task ${params.taskId} for user ${userId}`);

      // First check if the task exists and belongs to the user
      const existingTask = await prisma.todo.findFirst({
        where: {
          id: params.taskId,
          userId: userId
        }
      });

      if (!existingTask) {
        throw new Error(`Task ${params.taskId} not found or doesn't belong to user`);
      }

      // Parse date string to Date object if present
      let dueDate = undefined;
      if (params.dueDate) {
        dueDate = new Date(params.dueDate);
      }

      // Update the task
      const updatedTask = await prisma.todo.update({
        where: {
          id: params.taskId
        },
        data: {
          title: params.title !== undefined ? params.title : undefined,
          description: params.description !== undefined ? params.description : undefined,
          priority: params.priority !== undefined ? params.priority : undefined,
          dueDate: params.dueDate !== undefined ? dueDate : undefined,
          completed: params.completed !== undefined ? params.completed : undefined
        }
      });

      logger.info(`Task ${params.taskId} updated`);
      return updatedTask;
    } catch (error) {
      logger.error(`Error updating task: ${(error as Error).message}`);
      throw new Error(`Failed to update task: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a task for a user
   */
  private async deleteTask(userId: string, params: DeleteTaskParams): Promise<{ success: boolean, message: string }> {
    try {
      logger.info(`Deleting task ${params.taskId} for user ${userId}`);

      // First check if the task exists and belongs to the user
      const existingTask = await prisma.todo.findFirst({
        where: {
          id: params.taskId,
          userId: userId
        }
      });

      if (!existingTask) {
        throw new Error(`Task ${params.taskId} not found or doesn't belong to user`);
      }

      // Delete the task
      await prisma.todo.delete({
        where: {
          id: params.taskId
        }
      });

      logger.info(`Task ${params.taskId} deleted`);
      return { success: true, message: `Task ${params.taskId} deleted successfully` };
    } catch (error) {
      logger.error(`Error deleting task: ${(error as Error).message}`);
      throw new Error(`Failed to delete task: ${(error as Error).message}`);
    }
  }

  /**
   * Get tasks for a user with optional filtering
   */
  private async getTasks(userId: string, params: GetTasksParams): Promise<Todo[]> {
    try {
      logger.info(`Getting tasks for user ${userId} with filters: ${JSON.stringify(params)}`);

      // Build the where clause for filtering
      const where: any = { userId };
      
      if (params.priority) {
        where.priority = params.priority;
      }
      
      if (params.completed !== undefined) {
        where.completed = params.completed;
      }
      
      if (params.dueBefore) {
        where.dueDate = {
          ...(where.dueDate || {}),
          lte: new Date(params.dueBefore)
        };
      }
      
      if (params.dueAfter) {
        where.dueDate = {
          ...(where.dueDate || {}),
          gte: new Date(params.dueAfter)
        };
      }

      // Query the tasks
      const tasks = await prisma.todo.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      logger.info(`Found ${tasks.length} tasks for user ${userId}`);
      return tasks;
    } catch (error) {
      logger.error(`Error getting tasks: ${(error as Error).message}`);
      throw new Error(`Failed to get tasks: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze productivity for a user
   */
  private async analyzeProductivity(userId: string, params: AnalyzeProductivityParams): Promise<any> {
    try {
      logger.info(`Analyzing productivity for user ${userId}`);
      
      // Define the date range for analysis
      const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      const endDate = params.endDate ? new Date(params.endDate) : new Date();
      
      // Get completed tasks in the date range
      const completedTasks = await prisma.todo.findMany({
        where: {
          userId,
          completed: true,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      // Get incomplete tasks in the date range
      const incompleteTasks = await prisma.todo.findMany({
        where: {
          userId,
          completed: false,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      // Get overdue tasks
      const overdueTasks = await prisma.todo.findMany({
        where: {
          userId,
          completed: false,
          dueDate: {
            lt: new Date()
          }
        }
      });
      
      // Calculate completion rate
      const totalTasks = completedTasks.length + incompleteTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
      
      // Group completed tasks by priority
      const completedByPriority = {
        high: completedTasks.filter(task => task.priority === 'high').length,
        medium: completedTasks.filter(task => task.priority === 'medium').length,
        low: completedTasks.filter(task => task.priority === 'low').length
      };
      
      // Calculate average completion time
      const completionTimes = completedTasks
        .filter(task => task.dueDate)
        .map(task => {
          const createdAt = new Date(task.createdAt);
          const completedAt = task.dueDate as Date; // Assuming dueDate is when it was completed
          return (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24); // Days
        });
      
      const avgCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 0;
      
      return {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        },
        summary: {
          totalTasks,
          completedTasks: completedTasks.length,
          incompleteTasks: incompleteTasks.length,
          overdueTasks: overdueTasks.length,
          completionRate: completionRate.toFixed(2) + '%'
        },
        details: {
          completedByPriority,
          avgCompletionTime: avgCompletionTime.toFixed(2) + ' days'
        },
        recommendations: this.generateProductivityRecommendations(
          completedTasks,
          incompleteTasks,
          overdueTasks,
          completionRate
        )
      };
    } catch (error) {
      logger.error(`Error analyzing productivity: ${(error as Error).message}`);
      throw new Error(`Failed to analyze productivity: ${(error as Error).message}`);
    }
  }

  /**
   * Generate productivity recommendations based on task data
   */
  private generateProductivityRecommendations(
    completedTasks: Todo[],
    incompleteTasks: Todo[],
    overdueTasks: Todo[],
    completionRate: number
  ): string[] {
    const recommendations: string[] = [];
    
    // Low completion rate recommendation
    if (completionRate < 50) {
      recommendations.push(
        "Your task completion rate is below 50%. Consider breaking down tasks into smaller, more manageable items."
      );
    }
    
    // Overdue tasks recommendations
    if (overdueTasks.length > 0) {
      recommendations.push(
        `You have ${overdueTasks.length} overdue tasks. Consider reviewing and rescheduling these tasks.`
      );
      
      if (overdueTasks.length > 5) {
        recommendations.push(
          "You have a high number of overdue tasks. Try focusing on completing these before adding new tasks."
        );
      }
    }
    
    // High priority incomplete tasks
    const highPriorityIncomplete = incompleteTasks.filter(task => task.priority === 'high').length;
    if (highPriorityIncomplete > 0) {
      recommendations.push(
        `You have ${highPriorityIncomplete} high priority tasks incomplete. Consider focusing on these first.`
      );
    }
    
    // General recommendations
    if (completionRate > 80) {
      recommendations.push(
        "Great job on your high completion rate! Consider taking on more challenging tasks."
      );
    }
    
    return recommendations;
  }
}

export default new AssistantService(); 