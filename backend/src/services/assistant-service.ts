import { OpenAI } from 'openai';
import { PrismaClient, Todo } from '@prisma/client';
import config from '../config';
import logger from '../utils/logger';
import memoryService from './memory-service';
import pendingCallService from './pending-call-service';

const prisma = new PrismaClient();

// Log OpenAI API key configuration (mask most of it for security)
const apiKey = config.openai.apiKey;
const maskedKey = apiKey ? 
  `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` : 
  'not set';
logger.info(`Initializing OpenAI with API key: ${maskedKey}`);
logger.info(`Using OpenAI Assistant ID: ${config.openai.assistantId}`);

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
      logger.error('OpenAI Assistant ID is not configured. Please set OPENAI_ASSISTANT_ID in your .env file.');
      throw new Error('OpenAI Assistant ID is not configured. Please set OPENAI_ASSISTANT_ID in your .env file.');
    }
    
    if (!config.openai.apiKey) {
      logger.error('OpenAI API Key is not configured. Please set OPENAI_API_KEY in your .env file.');
      throw new Error('OpenAI API Key is not configured. Please set OPENAI_API_KEY in your .env file.');
    }
    
    logger.info('OpenAI Assistant service initialized successfully.');
  }

  /**
   * Create a new thread for a user
   */
  async createThread(userId: string): Promise<string> {
    try {
      logger.info(`Creating new thread for user ${userId}`);
      
      // Create a real thread using OpenAI API
      const thread = await openai.beta.threads.create();
      const threadId = thread.id;
      
      logger.info(`Thread created with ID: ${threadId}`);
      
      // Save the thread ID for the user
      await prisma.assistantThread.create({
        data: {
          userId,
          threadId,
          lastUsed: new Date()
        }
      });
      
      return threadId;
    } catch (error) {
      logger.error(`Error creating thread: ${(error as Error).message}`);
      throw new Error(`Failed to create thread: ${(error as Error).message}`);
    }
  }

  /**
   * Get or create a thread for a user
   */
  async getOrCreateThreadForUser(userId: string): Promise<string> {
    try {
      // Look for an existing thread for this user
      // First, check if the user already has an entry in AssistantThread table
      const existingThreadEntry = await prisma.assistantThread.findFirst({
        where: { userId }
      });

      // If found, update the lastUsed timestamp and return the threadId
      if (existingThreadEntry) {
        await prisma.assistantThread.update({
          where: { id: existingThreadEntry.id },
          data: { lastUsed: new Date() }
        });
        logger.info(`Found existing thread ${existingThreadEntry.threadId} for user ${userId}`);
        return existingThreadEntry.threadId;
      }

      // If no existing thread, create a new one
      const threadId = await this.createThread(userId);
      
      // Store the new thread in the database
      await prisma.assistantThread.create({
        data: {
          userId,
          threadId,
          lastUsed: new Date()
        }
      });
      
      logger.info(`Created new thread ${threadId} for user ${userId}`);
      return threadId;
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
      
      // First check if there are any active runs on this thread
      try {
        const runsList = await openai.beta.threads.runs.list(threadId, {
          limit: 1
        });
        
        if (runsList.data.length > 0) {
          const latestRun = runsList.data[0];
          if (['in_progress', 'queued', 'requires_action'].includes(latestRun.status)) {
            logger.warn(`Thread ${threadId} has an active run ${latestRun.id} with status ${latestRun.status}`);
            
            // If there's an active run, try to wait for it to complete before continuing
            if (latestRun.status === 'requires_action' || latestRun.status === 'in_progress') {
              logger.info(`Waiting for active run ${latestRun.id} to complete...`);
              try {
                await this.waitForRunCompletion(threadId, latestRun.id);
                logger.info(`Previous run ${latestRun.id} completed, proceeding with new message`);
              } catch (runWaitError) {
                logger.error(`Error waiting for run completion: ${(runWaitError as Error).message}`);
                throw new Error(`Please wait until the previous request completes: ${(runWaitError as Error).message}`);
              }
            }
          }
        }
      } catch (checkRunError) {
        logger.error(`Error checking for active runs: ${(checkRunError as Error).message}`);
        // Continue anyway, as we'll catch any issues when adding the message
      }
      
      // Get the user's memory and context
      const userContext = await memoryService.generateAssistantContext(userId);
      
      console.log('userContext',userContext);
      
      let runId: string;
      
      try {
        // Add the user message to the thread
        await openai.beta.threads.messages.create(threadId, {
          role: 'user',
          content: message,
        });
        
        // Run the assistant on the thread with user context
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: this.assistantId,
          additional_instructions: userContext ? `Use this context about the user to personalize your responses:\n\n${userContext}` : undefined
        });
        
        runId = run.id;
      } catch (apiError: any) {
        // Specifically handle the case where a run is already active
        if (apiError.status === 400 && apiError.message && apiError.message.includes('while a run') && apiError.message.includes('is active')) {
          logger.warn(`Caught active run error: ${apiError.message}`);
          // Extract run ID from the error message if possible
          const runIdMatch = apiError.message.match(/run_\w+/);
          const activeRunId = runIdMatch ? runIdMatch[0] : null;
          
          if (activeRunId) {
            try {
              logger.info(`Waiting for active run ${activeRunId} to complete before retrying`);
              // Wait for the active run to complete
              await this.waitForRunCompletion(threadId, activeRunId);
              
              // Add a small delay to ensure the run is fully complete on OpenAI's side
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Double-check run status before retrying
              const verifyRunStatus = await openai.beta.threads.runs.retrieve(threadId, activeRunId);
              if (['in_progress', 'queued'].includes(verifyRunStatus.status)) {
                logger.warn(`Run ${activeRunId} still shows status ${verifyRunStatus.status} after waiting. Delaying retry.`);
                throw new Error(`Previous request is still processing. Please try again in a few moments.`);
              } else if (verifyRunStatus.status === 'requires_action') {
                // If run requires action, return the run information instead of showing an error
                logger.info(`Run ${activeRunId} requires action, retrieving information`);
                
                // Get latest messages for context
                const messages = await openai.beta.threads.messages.list(threadId);
                
                // Prepare response with action requirements
                const assistantMessages = messages.data
                  .filter(msg => msg.role === 'assistant')
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                
                if (assistantMessages.length === 0) {
                  throw new Error('No response available');
                }
                
                // Check for pending calls
                const pendingCalls = await pendingCallService.getPendingCalls(userId);
                
                // Return the current state with requires_action flag
                return {
                  ...assistantMessages[0],
                  requires_action: true,
                  run_id: activeRunId,
                  has_pending_calls: pendingCalls.length > 0,
                  pending_calls_count: pendingCalls.length
                };
              }
              
              // After the run completes, retry creating a new message and run
              logger.info(`Previous run completed, retrying message send`);
              const retryMessage = await openai.beta.threads.messages.create(threadId, {
                role: 'user',
                content: message,
              });
              
              const retryRun = await openai.beta.threads.runs.create(threadId, {
                assistant_id: this.assistantId,
                instructions: userContext,
              });
              
              runId = retryRun.id;
            } catch (retryError) {
              logger.error(`Error during retry after active run: ${(retryError as Error).message}`);
              throw new Error(`Unable to process your request. Please try again in a few moments.`);
            }
          } else {
            // If we couldn't extract a run ID, ask the user to wait
            throw new Error(`Please wait a moment. Your previous request is still being processed.`);
          }
        } else {
          // For other API errors, rethrow
          throw apiError;
        }
      }
      
      // Wait for the run to complete
      const completedRun = await this.waitForRunCompletion(threadId, runId);
      
      // Track executed functions
      const executedFunctions = [];
      
      // Check if there are any required actions (function calls)
      if (completedRun.status === 'requires_action' && 
          completedRun.required_action?.type === 'submit_tool_outputs') {
        
        // Handle function calls
        const toolCalls = completedRun.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];
        
        for (const tool of toolCalls) {
          const functionName = tool.function.name;
          const functionArgs = JSON.parse(tool.function.arguments);
          
          try {
            let result;
            let needsConfirmation = false;
            
            // Determine if this function call needs confirmation or can be executed directly
            switch (functionName) {
              case 'create_task':
                // Direct execution for clear task creation
                if (functionArgs.title && functionArgs.title.trim() !== '') {
                  result = await this.createTask(userId, functionArgs);
                  executedFunctions.push({
                    function: functionName,
                    args: functionArgs,
                    result: { id: result.id, title: result.title }
                  });
                } else {
                  needsConfirmation = true;
                }
                break;
                
              case 'update_task':
                // Direct execution when taskId is provided
                if (functionArgs.taskId) {
                  result = await this.updateTask(userId, functionArgs);
                  executedFunctions.push({
                    function: functionName,
                    args: functionArgs,
                    result: { id: result.id, title: result.title }
                  });
                } else {
                  needsConfirmation = true;
                }
                break;
                
              case 'delete_task':
                // This always needs confirmation
                needsConfirmation = true;
                break;
                
              case 'get_tasks':
                // Direct execution for reading tasks
                result = await this.getTasks(userId, functionArgs);
                executedFunctions.push({
                  function: functionName,
                  args: functionArgs,
                  result: { count: result.length }
                });
                break;
                
              case 'analyze_productivity':
                // Direct execution for analysis
                result = await this.analyzeProductivity(
                  userId, 
                  functionArgs.startDate, 
                  functionArgs.endDate
                );
                executedFunctions.push({
                  function: functionName,
                  args: functionArgs,
                  result: { analysisGenerated: true }
                });
                break;
                
              default:
                needsConfirmation = true;
                break;
            }
            
            if (needsConfirmation) {
              // Store for confirmation instead of executing
              await pendingCallService.createPendingCall(
                userId,
                threadId,
                runId,
                tool.id,
                functionName,
                tool.function.arguments
              );
              
              toolOutputs.push({
                tool_call_id: tool.id,
                output: JSON.stringify({
                  status: 'needs_confirmation',
                  message: `The ${functionName} action requires your confirmation.`
                }),
              });
            } else {
              // Return the successful result
              toolOutputs.push({
                tool_call_id: tool.id,
                output: JSON.stringify(result),
              });
              
              // Log the executed function
              logger.info(`Executed function ${functionName} for user ${userId}`);
            }
          } catch (error) {
            toolOutputs.push({
              tool_call_id: tool.id,
              output: JSON.stringify({ error: (error as Error).message }),
            });
          }
        }
        
        // Submit the tool outputs
        await openai.beta.threads.runs.submitToolOutputs(
          threadId,
          completedRun.id,
          { tool_outputs: toolOutputs }
        );
        
        // Wait for the run to complete again after submitting tool outputs
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
      
      // Record this interaction in the user's memory
      await this.recordInteraction(userId, message, assistantMessages[0]);
      
      // Check if there are any pending confirmations for this user
      const pendingCalls = await pendingCallService.getPendingCalls(userId);
      
      // Enhance the response with function execution information and pending confirmations
      const originalContent = assistantMessages[0].content;
      const enhancedMessage = {
        ...assistantMessages[0],
        content: originalContent,
        executed_functions: executedFunctions,
        has_pending_calls: pendingCalls.length > 0,
        pending_calls_count: pendingCalls.length
      };
      
      // If functions were executed, ensure they're visible in the response
      if (executedFunctions.length > 0 || pendingCalls.length > 0) {
        // The frontend will use this information to display executed functions
        logger.info(`Response includes ${executedFunctions.length} executed functions and ${pendingCalls.length} pending calls`);
        
        // If tasks were created, add a note that they're available in the task list
        const createdTasks = executedFunctions.filter(fn => fn.function === 'create_task');
        if (createdTasks.length > 0) {
          logger.info(`${createdTasks.length} tasks were created and are available in the user's task list`);
          
          // Find the first text content to append to
          if (Array.isArray(enhancedMessage.content)) {
            for (let i = 0; i < enhancedMessage.content.length; i++) {
              const content = enhancedMessage.content[i];
              if (content.type === 'text' && content.text) {
                // Add a futuristic task creation note
                content.text.value += `\n\n⚡️ **AI ASSISTANT ACTION:** ${createdTasks.length > 1 ? 'Multiple tasks have' : 'A task has'} been created and added to your task list. ${createdTasks.length > 1 ? 'They are' : 'It is'} now available in your Tasks dashboard.`;
                break;
              }
            }
          }
        }
      }
      
      return enhancedMessage;
    } catch (error) {
      logger.error(`Error sending message: ${(error as Error).message}`);
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
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
  private async processFunctionCalls(userId: string, threadId: string, runId: string, toolCalls: any[]): Promise<any[]> {
    const toolOutputs = [];
    
    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionArgs = tool.function.arguments;
      
      try {
        // Store the function call for user approval instead of executing immediately
        await pendingCallService.createPendingCall(
          userId,
          threadId,
          runId,
          tool.id,
          functionName,
          functionArgs
        );
        
        // Return a message indicating that user approval is required
        toolOutputs.push({
          tool_call_id: tool.id,
          output: JSON.stringify({
            status: 'pending_approval',
            message: `The ${functionName} action requires your approval before it can be executed.`
          }),
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
   * Execute an approved function call
   */
  async executeApprovedCall(userId: string, callId: string): Promise<any> {
    try {
      // Get the pending call
      const pendingCall = await pendingCallService.getPendingCallById(callId, userId);
      
      if (pendingCall.status !== 'approved') {
        throw new Error('This function call has not been approved');
      }
      
      const functionName = pendingCall.functionName;
      const functionArgs = JSON.parse(pendingCall.functionArgs);
      
      let result;
      
      // Execute the appropriate function based on the name
      switch (functionName) {
        case 'create_task':
          result = await this.createTask(userId, functionArgs);
          
          // Log detailed information for debugging
          logger.info(`Task created successfully via approval: ${result.id} - ${result.title} for user ${userId}`);
          break;
          
        case 'update_task':
          result = await this.updateTask(userId, functionArgs);
          
          // Log detailed information for debugging
          logger.info(`Task updated successfully via approval: ${result.id} - ${result.title} for user ${userId}`);
          break;
          
        case 'delete_task':
          result = await this.deleteTask(userId, functionArgs);
          
          // Log detailed information for debugging
          logger.info(`Task deleted successfully via approval: ${functionArgs.taskId} for user ${userId}`);
          break;
          
        case 'get_tasks':
          result = await this.getTasks(userId, functionArgs);
          break;
          
        case 'analyze_productivity':
          result = await this.analyzeProductivity(userId, functionArgs.startDate, functionArgs.endDate);
          break;
          
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
      
      // Return the result
      return result;
        
    } catch (error) {
      logger.error(`Error executing approved call: ${(error as Error).message}`);
      throw new Error(`Failed to execute approved call: ${(error as Error).message}`);
    }
  }

  /**
   * Create a task
   */
  private async createTask(userId: string, params: CreateTaskParams): Promise<any> {
    try {
      const { title, description, priority = 'medium', dueDate } = params;
      
      logger.info(`Creating task: ${title} for user ${userId}`);
      
      // Convert the dueDate from string to Date
      const dueDateObj = dueDate ? new Date(dueDate) : null;

      // Create the task in the database
      const task = await prisma.todo.create({
        data: {
          title,
          description: description || '',
          priority,
          dueDate: dueDateObj,
          userId,
          isAIGenerated: true // Mark as AI generated since this is called from the assistant
        }
      });

      // Record this action in user memory
      await memoryService.recordUserAction(userId, 'task_created', {
        taskId: task.id,
        title,
        priority,
        dueDate: dueDateObj?.toISOString() || null,
        isAIGenerated: true
      });
      
      // Update user's task preferences in memory if needed
      await this.updateTaskPatterns(userId, 'create', task);
      
      return task;
    } catch (error) {
      logger.error(`Error creating task: ${(error as Error).message}`);
      throw new Error(`Failed to create task: ${(error as Error).message}`);
    }
  }

  /**
   * Update a task
   */
  private async updateTask(userId: string, params: UpdateTaskParams): Promise<any> {
    try {
      const { taskId, title, description, priority, dueDate, completed } = params;
      
      logger.info(`Updating task: ${taskId} for user ${userId}`);

      // Verify the task belongs to the user
      const existingTask = await prisma.todo.findFirst({
        where: {
          id: taskId,
          userId
        }
      });

      if (!existingTask) {
        throw new Error(`Task not found or does not belong to user`);
      }
      
      // Create the update data
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (completed !== undefined) updateData.completed = completed;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

      // Update the task
      const updatedTask = await prisma.todo.update({
        where: { id: taskId },
        data: updateData
      });

      // Record this action in user memory
      await memoryService.recordUserAction(userId, 'task_updated', {
        taskId,
        updates: updateData,
        isAIGenerated: true
      });
      
      // If task was completed, update user patterns
      if (completed === true && !existingTask.completed) {
        await this.updateTaskPatterns(userId, 'complete', updatedTask);
      }
      
      return updatedTask;
    } catch (error) {
      logger.error(`Error updating task: ${(error as Error).message}`);
      throw new Error(`Failed to update task: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a task
   */
  private async deleteTask(userId: string, params: DeleteTaskParams): Promise<any> {
    try {
      const { taskId } = params;
      
      logger.info(`Deleting task: ${taskId} for user ${userId}`);

      // Verify the task belongs to the user
      const existingTask = await prisma.todo.findFirst({
        where: {
          id: taskId,
          userId
        }
      });

      if (!existingTask) {
        throw new Error(`Task not found or does not belong to user`);
      }

      // Delete the task
      await prisma.todo.delete({
        where: { id: taskId }
      });

      // Record this action in user memory
      await memoryService.recordUserAction(userId, 'task_deleted', {
        taskId,
        title: existingTask.title,
        isAIGenerated: true
      });
      
      return { success: true, message: `Task ${taskId} deleted successfully` };
    } catch (error) {
      logger.error(`Error deleting task: ${(error as Error).message}`);
      throw new Error(`Failed to delete task: ${(error as Error).message}`);
    }
  }

  /**
   * Update user's task patterns in memory
   */
  private async updateTaskPatterns(userId: string, action: 'create' | 'complete', task: Todo) {
    try {
      // Get the user's memory
      const memory = await memoryService.getOrCreateUserMemory(userId);
      
      // Get existing work patterns or initialize
      const patterns = memory.workPatterns as any || {};
      
      // Initialize counters if not present
      if (!patterns.tasksByPriority) {
        patterns.tasksByPriority = { high: 0, medium: 0, low: 0 };
      }
      
      if (!patterns.completionsByPriority) {
        patterns.completionsByPriority = { high: 0, medium: 0, low: 0 };
      }
      
      if (!patterns.preferredDueDates) {
        patterns.preferredDueDates = {
          withDueDate: 0,
          withoutDueDate: 0,
          averageDaysToComplete: 0,
          totalCompletedWithDueDate: 0
        };
      }
      
      // Update statistics based on action
      if (action === 'create') {
        // Increment tasks by priority
        patterns.tasksByPriority[task.priority]++;
        
        // Track due date preference
        if (task.dueDate) {
          patterns.preferredDueDates.withDueDate++;
        } else {
          patterns.preferredDueDates.withoutDueDate++;
        }
      } else if (action === 'complete') {
        // Increment completions by priority
        patterns.completionsByPriority[task.priority]++;
        
        // If task had a due date, calculate days to complete
        if (task.dueDate) {
          const created = task.createdAt.getTime();
          const completed = new Date().getTime();
          const dueDate = task.dueDate.getTime();
          
          // Update average days to complete
          const daysToComplete = Math.round((completed - created) / (1000 * 60 * 60 * 24));
          const totalCompleted = patterns.preferredDueDates.totalCompletedWithDueDate;
          const currentAvg = patterns.preferredDueDates.averageDaysToComplete;
          
          // Calculate new average
          patterns.preferredDueDates.totalCompletedWithDueDate++;
          patterns.preferredDueDates.averageDaysToComplete = 
            (currentAvg * totalCompleted + daysToComplete) / (totalCompleted + 1);
        }
      }
      
      // Calculate completion rates
      const totalByPriority = patterns.tasksByPriority;
      const completedByPriority = patterns.completionsByPriority;
      
      patterns.completionRate = {
        overall: this.calculateRate(
          completedByPriority.high + completedByPriority.medium + completedByPriority.low,
          totalByPriority.high + totalByPriority.medium + totalByPriority.low
        ),
        byPriority: {
          high: this.calculateRate(completedByPriority.high, totalByPriority.high),
          medium: this.calculateRate(completedByPriority.medium, totalByPriority.medium),
          low: this.calculateRate(completedByPriority.low, totalByPriority.low)
        }
      };
      
      // Update the work patterns in memory
      await memoryService.updateMemoryField(userId, 'workPatterns', patterns);
    } catch (error) {
      // Log but don't fail the operation
      logger.error(`Error updating task patterns: ${(error as Error).message}`);
    }
  }
  
  /**
   * Helper function to calculate rate
   */
  private calculateRate(completed: number, total: number): number {
    if (total === 0) return 0;
    return Number((completed / total * 100).toFixed(1));
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
   * Analyze user productivity
   */
  async analyzeProductivity(userId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      logger.info(`Analyzing productivity for user ${userId}`);
      
      // Create date range filters
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // default to last 30 days
      const end = endDate ? new Date(endDate) : new Date();
      
      // Get all tasks for the user
      const tasks = await prisma.todo.findMany({
        where: {
          userId,
          createdAt: {
            gte: start,
            lte: end
          }
        }
      });
      
      // Get completed tasks
      const completedTasks = tasks.filter(task => task.completed);
      
      // Calculate statistics
      const totalTasks = tasks.length;
      const completedCount = completedTasks.length;
      const completionRate = totalTasks > 0 ? (completedCount / totalTasks * 100).toFixed(1) : 0;
      
      // Calculate tasks by priority
      const tasksByPriority = {
        high: tasks.filter(task => task.priority === 'high').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        low: tasks.filter(task => task.priority === 'low').length
      };
      
      // Calculate completion rate by priority
      const completionByPriority = {
        high: {
          total: tasksByPriority.high,
          completed: completedTasks.filter(task => task.priority === 'high').length,
          rate: tasksByPriority.high > 0 
            ? (completedTasks.filter(task => task.priority === 'high').length / tasksByPriority.high * 100).toFixed(1) 
            : 0
        },
        medium: {
          total: tasksByPriority.medium,
          completed: completedTasks.filter(task => task.priority === 'medium').length,
          rate: tasksByPriority.medium > 0 
            ? (completedTasks.filter(task => task.priority === 'medium').length / tasksByPriority.medium * 100).toFixed(1) 
            : 0
        },
        low: {
          total: tasksByPriority.low,
          completed: completedTasks.filter(task => task.priority === 'low').length,
          rate: tasksByPriority.low > 0 
            ? (completedTasks.filter(task => task.priority === 'low').length / tasksByPriority.low * 100).toFixed(1) 
            : 0
        }
      };
      
      // Get overdue tasks
      const now = new Date();
      const overdueTasks = tasks.filter(
        task => !task.completed && task.dueDate && task.dueDate < now
      );
      
      // Calculate average task age for completed tasks
      let totalAgeInDays = 0;
      completedTasks.forEach(task => {
        const created = task.createdAt.getTime();
        const completed = new Date().getTime();
        const ageInDays = (completed - created) / (1000 * 60 * 60 * 24);
        totalAgeInDays += ageInDays;
      });
      
      const averageTaskAgeInDays = completedTasks.length > 0 
        ? (totalAgeInDays / completedTasks.length).toFixed(1) 
        : 0;
      
      // Get user memory data
      const memory = await memoryService.getOrCreateUserMemory(userId);
      
      // Construct the productivity data
      const productivityData = {
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          days: Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        },
        overview: {
          totalTasks,
          completedTasks: completedCount,
          completionRate,
          overdueTasks: overdueTasks.length,
          averageTaskAgeInDays
        },
        byPriority: completionByPriority,
        // Include historical patterns from user memory if available
        patterns: memory.workPatterns || {}
      };
      
      // Generate personalized recommendations based on the data and memory
      const recommendations = await this.generateProductivityRecommendations(userId, productivityData, memory);
      
      return {
        ...productivityData,
        recommendations
      };
    } catch (error) {
      logger.error(`Error analyzing productivity: ${(error as Error).message}`);
      throw new Error(`Failed to analyze productivity: ${(error as Error).message}`);
    }
  }

  /**
   * Generate personalized productivity recommendations
   */
  private async generateProductivityRecommendations(
    userId: string, 
    productivityData: any, 
    memory: any
  ): Promise<string[]> {
    // Basic recommendations
    const recommendations: string[] = [];
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        shortTermGoals: true,
        longTermGoals: true
      }
    });
    
    // Completion rate recommendations
    const completionRate = parseFloat(productivityData.overview.completionRate);
    if (completionRate < 50) {
      recommendations.push("Your task completion rate is below 50%. Consider creating fewer tasks or breaking large tasks into smaller, more manageable ones.");
    } else if (completionRate > 80) {
      recommendations.push("Great job! Your completion rate is very high. You might be ready to take on more challenging tasks.");
    }
    
    // Overdue task recommendations
    if (productivityData.overview.overdueTasks > 0) {
      if (productivityData.overview.overdueTasks > 5) {
        recommendations.push(`You have ${productivityData.overview.overdueTasks} overdue tasks. Consider focusing on these before creating new ones.`);
      } else {
        recommendations.push(`You have a few overdue tasks. Try to address them soon to maintain your productivity.`);
      }
    }
    
    // Priority-based recommendations
    const highPriorityRate = parseFloat(productivityData.byPriority.high.rate);
    if (highPriorityRate < 70 && productivityData.byPriority.high.total > 0) {
      recommendations.push("Your completion rate for high priority tasks is lower than ideal. Consider focusing more on high priority items.");
    }
    
    // Personalized recommendations based on user's memory and goals
    if (memory && memory.workPatterns) {
      const patterns = memory.workPatterns as any;
      
      // Due date preferences
      if (patterns.preferredDueDates) {
        const { withDueDate, withoutDueDate } = patterns.preferredDueDates;
        if (withDueDate > withoutDueDate * 2) {
          recommendations.push("You seem to work well with deadlines. Continue setting due dates for your tasks for better productivity.");
        } else if (withoutDueDate > withDueDate * 2) {
          recommendations.push("You often create tasks without due dates. Setting deadlines might help you prioritize better.");
        }
      }
      
      // Priority distribution
      if (patterns.tasksByPriority) {
        const { high, medium, low } = patterns.tasksByPriority;
        const total = high + medium + low;
        
        if (total > 0) {
          const highPercent = (high / total) * 100;
          
          if (highPercent > 50) {
            recommendations.push("You mark over 50% of your tasks as high priority. Being more selective with priorities might help you focus better.");
          } else if (highPercent < 10 && total > 10) {
            recommendations.push("You rarely use high priority. Don't hesitate to mark truly important tasks as high priority to ensure they get proper attention.");
          }
        }
      }
    }
    
    // Goal-based recommendations
    if (user?.shortTermGoals) {
      recommendations.push(`Based on your short-term goals: "${user.shortTermGoals}", consider creating specific tasks that directly contribute to these objectives.`);
    }
    
    // If we don't have many recommendations, add a generic one
    if (recommendations.length < 2) {
      recommendations.push("Regular reviews of your task list can help you stay organized and maintain momentum on your projects.");
    }
    
    return recommendations;
  }

  /**
   * Get chat history for a user's thread
   */
  async getChatHistory(userId: string, threadId: string, limit: number = 20): Promise<any[]> {
    try {
      logger.info(`Getting chat history for thread ${threadId} for user ${userId}`);
      
      // Retrieve messages from the thread
      const messages = await openai.beta.threads.messages.list(threadId, {
        limit: limit,
        order: 'desc'
      });
      
      return messages.data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.created_at * 1000).toISOString()
      }));
    } catch (error) {
      logger.error(`Error getting chat history: ${(error as Error).message}`);
      throw new Error(`Failed to get chat history: ${(error as Error).message}`);
    }
  }

  /**
   * Record an interaction in the user's memory
   */
  private async recordInteraction(userId: string, userMessage: string, assistantResponse: any) {
    try {
      // Extract text from assistant response
      let responseText = '';
      if (assistantResponse.content && assistantResponse.content.length > 0) {
        for (const content of assistantResponse.content) {
          if (content.type === 'text') {
            responseText += content.text.value + '\n';
          }
        }
      }
      
      // Create a memory entry
      const memoryEntry = `User: ${userMessage}\nAssistant: ${responseText.trim()}`;
      
      // Add to memory
      await memoryService.appendToMemoryText(userId, memoryEntry);
      
      // Record user action
      await memoryService.recordUserAction(userId, 'chat_interaction', {
        userMessage,
        assistantResponsePreview: responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText
      });
      
      // Analyze and update preferences if possible (advanced feature, could be expanded)
      this.updateUserPreferencesFromMessage(userId, userMessage, responseText);
    } catch (error) {
      // Log but don't fail the main operation
      logger.error(`Error recording interaction: ${(error as Error).message}`);
    }
  }
  
  /**
   * Update user preferences based on message content
   */
  private async updateUserPreferencesFromMessage(userId: string, userMessage: string, assistantResponse: string) {
    try {
      // This is a basic implementation that could be expanded
      const message = userMessage.toLowerCase();
      
      // Check for task preferences
      if (message.includes('prefer') || message.includes('like') || message.includes('want')) {
        // Update task preferences memory
        const memory = await memoryService.getOrCreateUserMemory(userId);
        const preferences = memory.taskPreferences as any || {};
        
        // Simple pattern matching for preferences
        if (message.includes('high priority')) {
          preferences.preferredPriority = 'high';
        } else if (message.includes('medium priority')) {
          preferences.preferredPriority = 'medium';
        } else if (message.includes('low priority')) {
          preferences.preferredPriority = 'low';
        }
        
        // Update memory
        await memoryService.updateMemoryField(userId, 'taskPreferences', preferences);
      }
      
      // More advanced preference analysis could be added here
    } catch (error) {
      logger.error(`Error updating preferences: ${(error as Error).message}`);
    }
  }
}

export default new AssistantService(); 