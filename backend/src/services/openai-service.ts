import OpenAI from 'openai';
import config from '../config';
import logger from '../utils/logger';
import { Task, TaskGenerationResponse } from '../types/task';

interface AssistantMessage {
  role: string;
  content: Array<{
    type: string;
    text?: {
      value: string;
    };
  }>;
}

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    logger.info('OpenAI service initialized');
  }

  /**
   * Generate a completion using OpenAI's API
   * @param prompt The prompt to send to OpenAI
   * @returns The generated text
   */
  async generateCompletion(prompt: string): Promise<string> {
    try {
      logger.info(`Generating completion for prompt: ${prompt.substring(0, 50)}...`);
      
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant for a todo list application. You help users organize tasks and provide structured responses.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const completion = response.choices[0]?.message?.content || '';
      logger.info('Completion generated successfully');
      
      return completion;
    } catch (error) {
      logger.error(`Error generating completion: ${(error as Error).message}`);
      throw new Error(`Failed to generate completion: ${(error as Error).message}`);
    }
  }

  /**
   * Generate structured tasks based on a user prompt using the OpenAI Assistant
   * @param prompt The user's prompt for task generation
   * @returns An array of generated tasks
   */
  async generateTasks(prompt: string): Promise<Task[]> {
    try {
      logger.info(`Generating tasks for prompt: ${prompt.substring(0, 50)}...`);
      
      // Create a thread
      const thread = await this.openai.beta.threads.create();
      logger.info(`Created thread with ID: ${thread.id}`);
      
      // Add a message to the thread
      await this.openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: `Generate a structured list of tasks for: ${prompt}. Please be detailed and include subtasks where appropriate.`
      });
      
      // Run the assistant on the thread
      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: config.openai.assistantId,
        instructions: `
          You are a task organization assistant. 
          Based on the user's input, generate a structured list of tasks.
          Return your response as a JSON array of task objects with the following structure:
          [
            {
              "title": "Task title",
              "description": "Detailed description of the task",
              "priority": "high|medium|low",
              "estimatedTime": "Estimated time to complete (e.g., '30 minutes', '2 hours')",
              "subtasks": [
                {
                  "title": "Subtask title",
                  "description": "Subtask description"
                }
              ]
            }
          ]
          Only respond with the JSON array, no additional text.
        `
      });
      
      // Wait for the run to complete
      let runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      // Poll for completion
      while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
        logger.info(`Run status: ${runStatus.status}`);
        
        // Wait for a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check status again
        runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
      }
      
      if (runStatus.status === 'failed') {
        logger.error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
        throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
      }
      
      // Get the messages from the thread
      const messages = await this.openai.beta.threads.messages.list(thread.id);
      
      // Find the assistant's response
      const assistantMessages = messages.data.filter((message: any) => message.role === 'assistant') as AssistantMessage[];
      
      if (assistantMessages.length === 0) {
        throw new Error('No response from assistant');
      }
      
      // Get the latest message content
      const latestMessage = assistantMessages[0];
      let content = '';
      
      // Extract text content from the message
      for (const contentPart of latestMessage.content) {
        if (contentPart.type === 'text') {
          content += contentPart.text?.value || '';
        }
      }
      
      // Clean up the content if it's wrapped in a markdown code block
      content = this.cleanMarkdownCodeBlock(content);
      
      // Parse the JSON response
      try {
        // Try to parse as a direct array first
        let parsedTasks: Task[] = [];
        
        try {
          parsedTasks = JSON.parse(content) as Task[];
        } catch {
          // If that fails, try to parse as an object with a tasks property
          const parsedResponse = JSON.parse(content) as TaskGenerationResponse;
          parsedTasks = parsedResponse.tasks || [];
        }
        
        // Ensure each task has the required properties
        const validatedTasks = parsedTasks.map(task => ({
          title: task.title || 'Untitled Task',
          description: task.description || '',
          priority: task.priority || 'medium',
          estimatedTime: task.estimatedTime || '1 hour',
          completed: false,
          subtasks: task.subtasks || []
        }));
        
        logger.info(`Successfully generated ${validatedTasks.length} tasks using Assistant`);
        return validatedTasks;
      } catch (parseError) {
        logger.error(`Error parsing Assistant response: ${(parseError as Error).message}`);
        logger.error(`Raw content: ${content}`);
        
        // Fallback to the regular API if parsing fails
        return this.generateTasksFallback(prompt);
      }
    } catch (error) {
      logger.error(`Error using Assistant API: ${(error as Error).message}`);
      logger.info('Falling back to regular completion API');
      
      // Fallback to the regular API
      return this.generateTasksFallback(prompt);
    }
  }
  
  /**
   * Clean up markdown code blocks from the content
   * @param content The content to clean
   * @returns The cleaned content
   */
  private cleanMarkdownCodeBlock(content: string): string {
    // Remove markdown code block syntax
    let cleanedContent = content.trim();
    
    // Check if the content starts with a markdown code block
    if (cleanedContent.startsWith('```')) {
      // Find the first line break
      const firstLineBreakIndex = cleanedContent.indexOf('\n');
      if (firstLineBreakIndex !== -1) {
        // Remove the first line (```json or similar)
        cleanedContent = cleanedContent.substring(firstLineBreakIndex + 1);
      }
    }
    
    // Check if the content ends with a markdown code block
    if (cleanedContent.endsWith('```')) {
      // Remove the last line
      const lastLineBreakIndex = cleanedContent.lastIndexOf('\n');
      if (lastLineBreakIndex !== -1) {
        cleanedContent = cleanedContent.substring(0, lastLineBreakIndex);
      }
    }
    
    return cleanedContent.trim();
  }
  
  /**
   * Fallback method to generate tasks using the regular completions API
   * @param prompt The user's prompt for task generation
   * @returns An array of generated tasks
   */
  private async generateTasksFallback(prompt: string): Promise<Task[]> {
    try {
      logger.info(`Using fallback method to generate tasks for prompt: ${prompt.substring(0, 50)}...`);
      
      const systemPrompt = `
        You are a task organization assistant. 
        Based on the user's input, generate a structured list of tasks.
        Return your response as a JSON array of task objects with the following structure:
        [
          {
            "title": "Task title",
            "description": "Detailed description of the task",
            "priority": "high|medium|low",
            "estimatedTime": "Estimated time to complete (e.g., '30 minutes', '2 hours')",
            "subtasks": [
              {
                "title": "Subtask title",
                "description": "Subtask description"
              }
            ]
          }
        ]
        Only respond with the JSON array, no additional text.
      `;
      
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{"tasks": []}';
      let parsedResponse: Task[] | TaskGenerationResponse;
      
      try {
        parsedResponse = JSON.parse(content) as Task[] | TaskGenerationResponse;
        // Handle both formats: direct array or { tasks: [] }
        const tasks = Array.isArray(parsedResponse) ? parsedResponse : 
                     (parsedResponse.tasks || []);
        
        logger.info(`Successfully generated ${tasks.length} tasks using fallback method`);
        return tasks;
      } catch (parseError) {
        logger.error(`Error parsing OpenAI response: ${(parseError as Error).message}`);
        throw new Error('Failed to parse the generated tasks');
      }
    } catch (error) {
      logger.error(`Error in fallback task generation: ${(error as Error).message}`);
      throw new Error(`Failed to generate tasks: ${(error as Error).message}`);
    }
  }
}

export default new OpenAIService(); 