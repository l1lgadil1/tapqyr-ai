import OpenAI from 'openai';
import config from '../config';
import logger from '../utils/logger';
import { Task, TaskGenerationResponse, Priority, Subtask } from '../types/task';

// Simple in-memory cache for language detection
interface LanguageCache {
  [key: string]: {
    language: string;
    timestamp: number;
  };
}

// Cache language detection results for 24 hours
const LANGUAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const languageCache: LanguageCache = {};

// Common language patterns for quick detection without API calls
const COMMON_LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  en: [/\b(the|is|are|and|in|to|for|with|that|this|have|you|will|can|your)\b/i],
  es: [/\b(el|la|los|las|es|son|y|en|para|con|que|este|esta|tiene|tu|usted)\b/i],
  fr: [/\b(le|la|les|est|sont|et|dans|pour|avec|que|ce|cette|avoir|vous|votre)\b/i],
  de: [/\b(der|die|das|ist|sind|und|in|für|mit|dass|diese|dieser|haben|du|sie|ihr)\b/i],
  ru: [/[а-яА-Я]{3,}/], // Russian characters
  zh: [/[\u4e00-\u9fff]{2,}/], // Chinese characters
  ja: [/[\u3040-\u309f\u30a0-\u30ff]{2,}/], // Japanese characters
  ko: [/[\uac00-\ud7af]{2,}/], // Korean characters
  ar: [/[\u0600-\u06ff]{2,}/], // Arabic characters
};

interface AssistantMessage {
  role: string;
  content: Array<{
    type: string;
    text?: {
      value: string;
    };
  }>;
}

// Simple in-memory cache for API responses
interface CacheEntry {
  value: string;
  expiresAt: number;
}

interface Cache {
  [key: string]: CacheEntry;
}

// In-memory cache
const apiCache: Cache = {};

// Cache cleanup interval (every 10 minutes)
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000;

class OpenAIService {
  private openai: OpenAI;
  private modelTokenLimits: Record<string, number> = {
    'gpt-3.5-turbo': 4096,
    'gpt-4': 8192,
    'gpt-4-turbo': 128000,
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    logger.info('OpenAI service initialized');
    
    // Set up cache cleanup interval
    setInterval(this.cleanupCache, CACHE_CLEANUP_INTERVAL);
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache = (): void => {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const key in apiCache) {
      if (apiCache[key].expiresAt < now) {
        delete apiCache[key];
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      logger.info(`Cache cleanup: removed ${expiredCount} expired entries`);
    }
  }

  /**
   * Detect the language of a text using pattern matching first, then OpenAI API as fallback
   * @param text The text to detect the language of
   * @returns The detected language code
   */
  private async detectLanguage(text: string): Promise<string> {
    try {
      // Create a cache key from the first 100 characters of the text
      const cacheKey = text.substring(0, 100);
      
      // Check if we have a cached result that's still valid
      if (languageCache[cacheKey] && 
          Date.now() - languageCache[cacheKey].timestamp < LANGUAGE_CACHE_TTL) {
        logger.info(`Using cached language detection: ${languageCache[cacheKey].language}`);
        return languageCache[cacheKey].language;
      }
      
      // Try to detect language using patterns first to avoid API calls
      for (const [langCode, patterns] of Object.entries(COMMON_LANGUAGE_PATTERNS)) {
        if (patterns.some(pattern => pattern.test(text))) {
          logger.info(`Detected language using pattern matching: ${langCode}`);
          
          // Cache the result
          languageCache[cacheKey] = {
            language: langCode,
            timestamp: Date.now()
          };
          
          return langCode;
        }
      }
      
      // If pattern matching fails, use OpenAI API
      logger.info('Pattern matching failed, using OpenAI for language detection...');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Use the smallest model for language detection
        messages: [
          { 
            role: 'system', 
            content: `You are a language detection system. Analyze the following text and determine what language it is written in.
            Return ONLY the ISO 639-1 language code (e.g., 'en' for English, 'es' for Spanish, 'fr' for French, etc.).
            If you cannot determine the language, return 'en'.` 
          },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const languageCode = response.choices[0]?.message?.content?.trim() || 'en';
      logger.info(`Detected language using OpenAI: ${languageCode}`);
      
      // Cache the result
      languageCache[cacheKey] = {
        language: languageCode,
        timestamp: Date.now()
      };
      
      return languageCode;
    } catch (error) {
      logger.error(`Error detecting language: ${(error as Error).message}`);
      // Default to English if language detection fails
      return 'en';
    }
  }

  /**
   * Get the appropriate model based on input length and complexity
   * @param inputLength Approximate length of the input
   * @param requiresComplexReasoning Whether the task requires complex reasoning
   * @returns The model name to use
   */
  private getAppropriateModel(inputLength: number, requiresComplexReasoning: boolean = false): string {
    // For very short inputs or simple tasks, use the most economical model
    if (inputLength < 100 && !requiresComplexReasoning) {
      return 'gpt-3.5-turbo';
    }
    
    // For medium-length inputs or tasks requiring some reasoning
    if (inputLength < 2000 || !requiresComplexReasoning) {
      return 'gpt-3.5-turbo-16k';
    }
    
    // For longer inputs or complex reasoning tasks
    return config.openai.model;
  }

  /**
   * Generate a completion using OpenAI's API
   * @param prompt The prompt to send to OpenAI
   * @param languageCode Optional language code to specify response language
   * @returns The generated text
   */
  async generateCompletion(prompt: string, languageCode?: string): Promise<string> {
    try {
      logger.info(`Generating completion for prompt: ${prompt.substring(0, 50)}...`);
      
      // Create a cache key that includes both the prompt and language
      const cacheKey = `completion:${languageCode || 'auto'}:${prompt.substring(0, 100)}`;
      
      // Check if we have this completion cached
      const cachedCompletion = await this.getFromCache(cacheKey);
      if (cachedCompletion) {
        logger.info('Using cached completion');
        return cachedCompletion;
      }
      
      // Detect the language of the prompt if not provided
      const detectedLanguage = languageCode || await this.detectLanguage(prompt);
      
      // Determine the appropriate model based on prompt length and complexity
      const inputLength = prompt.length;
      const requiresComplexReasoning = this.promptRequiresComplexReasoning(prompt);
      const model = this.getAppropriateModel(inputLength, requiresComplexReasoning);
      
      logger.info(`Using model ${model} for completion`);
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { 
            role: 'system', 
            content: `You are a helpful assistant for a todo list application. You help users organize tasks and provide structured responses.
            The user is writing in ${detectedLanguage} language. Please respond in the same language.
            Keep your responses concise and focused on helping with task management.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: this.calculateMaxTokens(model, prompt),
      });

      const completion = response.choices[0]?.message?.content || '';
      logger.info('Completion generated successfully');
      
      // Cache the completion
      await this.saveToCache(cacheKey, completion, 60 * 60); // Cache for 1 hour
      
      return completion;
    } catch (error) {
      logger.error(`Error generating completion: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Check if a prompt requires complex reasoning
   * @param prompt The prompt to analyze
   * @returns Whether the prompt requires complex reasoning
   */
  private promptRequiresComplexReasoning(prompt: string): boolean {
    // Keywords that might indicate complex reasoning is needed
    const complexKeywords = [
      'analyze', 'compare', 'contrast', 'evaluate', 'explain',
      'synthesize', 'recommend', 'prioritize', 'optimize',
      'strategy', 'plan', 'complex', 'difficult', 'challenging'
    ];
    
    // Check if the prompt contains any complex keywords
    return complexKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
  }

  /**
   * Calculate the maximum number of tokens to generate based on model and input
   * @param model The model being used
   * @param prompt The input prompt
   * @returns The maximum number of tokens to generate
   */
  private calculateMaxTokens(model: string, prompt: string): number {
    // Estimate input tokens (rough approximation: 4 chars ≈ 1 token)
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    
    // Get the model's token limit
    const modelLimit = this.modelTokenLimits[model] || 4096;
    
    // Reserve some tokens for the system message
    const systemMessageTokens = 150;
    
    // Calculate available tokens
    const availableTokens = modelLimit - estimatedInputTokens - systemMessageTokens;
    
    // Cap at a reasonable maximum and ensure we have at least 50 tokens
    return Math.min(Math.max(availableTokens, 50), 500);
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found
   */
  private async getFromCache(key: string): Promise<string | null> {
    const now = Date.now();
    const entry = apiCache[key];
    
    if (entry && entry.expiresAt > now) {
      return entry.value;
    }
    
    // Remove expired entry if it exists
    if (entry) {
      delete apiCache[key];
    }
    
    return null;
  }

  /**
   * Save a value to the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttlSeconds Time to live in seconds
   */
  private async saveToCache(key: string, value: string, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    
    apiCache[key] = {
      value,
      expiresAt
    };
  }

  /**
   * Generate tasks from a prompt
   * @param prompt The prompt to generate tasks from
   * @param languageCode Optional language code to specify response language
   * @returns The generated tasks
   */
  async generateTasks(prompt: string, languageCode?: string): Promise<Task[]> {
    try {
      logger.info(`Generating tasks for prompt: ${prompt.substring(0, 50)}...`);
      
      // Create a cache key that includes both the prompt and language
      const cacheKey = `tasks:${languageCode || 'auto'}:${prompt.substring(0, 100)}`;
      
      // Check if we have these tasks cached
      const cachedTasks = await this.getFromCache(cacheKey);
      if (cachedTasks) {
        logger.info('Using cached tasks');
        return JSON.parse(cachedTasks);
      }
      
      // Detect the language of the prompt if not provided
      const detectedLanguage = languageCode || await this.detectLanguage(prompt);
      
      // Determine the appropriate model based on prompt complexity
      const requiresComplexReasoning = this.promptRequiresComplexReasoning(prompt);
      const model = this.getAppropriateModel(prompt.length, requiresComplexReasoning);
      
      logger.info(`Using model ${model} for task generation`);
      
      // Check if the prompt is short enough for a single API call
      if (prompt.length < 500) {
        // For shorter prompts, use a more direct approach
        return await this.generateTasksDirectly(prompt, detectedLanguage, model, cacheKey);
      }
      
      // For longer prompts, use a two-step approach
      return await this.generateTasksWithAnalysis(prompt, detectedLanguage, model, cacheKey);
    } catch (error) {
      logger.error(`Error generating tasks: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Generate tasks directly with a single API call
   * @param prompt The prompt to generate tasks from
   * @param languageCode The language code
   * @param model The model to use
   * @param cacheKey The cache key for storing results
   * @returns The generated tasks
   */
  private async generateTasksDirectly(
    prompt: string, 
    languageCode: string, 
    model: string,
    cacheKey: string
  ): Promise<Task[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { 
            role: 'system', 
            content: `You are an AI assistant for a todo list application. 
            Generate a structured list of tasks based on the user's prompt.
            The user is writing in ${languageCode} language. Please generate tasks in the same language.
            
            Each task should have the following structure:
            {
              "title": "Task title",
              "description": "Detailed description of the task",
              "priority": "high" | "medium" | "low",
              "estimatedTime": "Time estimate (e.g., '30 minutes', '2 hours', '1 day')",
              "subtasks": [
                {
                  "title": "Subtask title",
                  "description": "Detailed description of the subtask"
                }
              ]
            }
            
            Return a JSON array of tasks.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content || '';
      
      try {
        // Try to parse the JSON response
        const parsedContent = JSON.parse(this.cleanMarkdownCodeBlock(content));
        
        // Check if the response has a 'tasks' property or is an array
        const tasks = Array.isArray(parsedContent) 
          ? parsedContent 
          : parsedContent.tasks || [];
        
        if (Array.isArray(tasks) && tasks.length > 0) {
          logger.info(`Successfully generated ${tasks.length} tasks`);
          
          // Cache the tasks
          await this.saveToCache(cacheKey, JSON.stringify(tasks), 60 * 60 * 24); // Cache for 24 hours
          
          return tasks;
        } else {
          logger.warn('Generated tasks array is empty or invalid');
          // Fall back to the alternative method
          return this.generateTasksFallback(prompt, languageCode);
        }
      } catch (error) {
        logger.error(`Error parsing tasks JSON: ${(error as Error).message}`);
        // Fall back to the alternative method
        return this.generateTasksFallback(prompt, languageCode);
      }
    } catch (error) {
      logger.error(`Error in direct task generation: ${(error as Error).message}`);
      return this.generateTasksFallback(prompt, languageCode);
    }
  }

  /**
   * Generate tasks with a two-step approach: first analyze, then generate
   * @param prompt The prompt to generate tasks from
   * @param languageCode The language code
   * @param model The model to use
   * @param cacheKey The cache key for storing results
   * @returns The generated tasks
   */
  private async generateTasksWithAnalysis(
    prompt: string, 
    languageCode: string, 
    model: string,
    cacheKey: string
  ): Promise<Task[]> {
    try {
      // Step 1: Analyze the prompt to identify key areas for tasks
      const analysisResponse = await this.openai.chat.completions.create({
        model,
        messages: [
          { 
            role: 'system', 
            content: `You are an AI assistant for a todo list application.
            Analyze the user's prompt and identify 3-7 key areas or categories that should be addressed with tasks.
            Return a JSON object with an array of areas, each with a title and brief description.
            Format: { "areas": [{ "title": "Area title", "description": "Brief description" }] }` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
      });

      const analysisContent = analysisResponse.choices[0]?.message?.content || '{}';
      let analysis;
      
      try {
        analysis = JSON.parse(analysisContent);
      } catch (error) {
        logger.error(`Error parsing analysis JSON: ${(error as Error).message}`);
        return this.generateTasksFallback(prompt, languageCode);
      }
      
      const areas = analysis.areas || [];
      
      if (!Array.isArray(areas) || areas.length === 0) {
        logger.warn('Analysis did not return valid areas');
        return this.generateTasksFallback(prompt, languageCode);
      }
      
      // Step 2: Generate tasks for each area
      const allTasks: Task[] = [];
      
      for (const area of areas) {
        const areaPrompt = `Generate tasks for: ${area.title}. Context: ${area.description}. Original request: ${prompt}`;
        
        const tasksResponse = await this.openai.chat.completions.create({
          model,
          messages: [
            { 
              role: 'system', 
              content: `You are an AI assistant for a todo list application.
              Generate 1-3 structured tasks for the specified area.
              The user is writing in ${languageCode} language. Please generate tasks in the same language.
              
              Each task should have the following structure:
              {
                "title": "Task title",
                "description": "Detailed description of the task",
                "priority": "high" | "medium" | "low",
                "estimatedTime": "Time estimate (e.g., '30 minutes', '2 hours', '1 day')",
                "subtasks": [
                  {
                    "title": "Subtask title",
                    "description": "Detailed description of the subtask"
                  }
                ]
              }
              
              Return a JSON array of tasks.` 
            },
            { role: 'user', content: areaPrompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
        
        const tasksContent = tasksResponse.choices[0]?.message?.content || '';
        
        try {
          const parsedTasks = JSON.parse(this.cleanMarkdownCodeBlock(tasksContent));
          const areaTasks = Array.isArray(parsedTasks) ? parsedTasks : parsedTasks.tasks || [];
          
          if (Array.isArray(areaTasks) && areaTasks.length > 0) {
            // Add category information to each task
            areaTasks.forEach(task => {
              task.category = area.title;
            });
            
            allTasks.push(...areaTasks);
          }
        } catch (error) {
          logger.error(`Error parsing tasks for area ${area.title}: ${(error as Error).message}`);
          // Continue with other areas
        }
      }
      
      if (allTasks.length > 0) {
        logger.info(`Successfully generated ${allTasks.length} tasks from ${areas.length} areas`);
        
        // Cache the tasks
        await this.saveToCache(cacheKey, JSON.stringify(allTasks), 60 * 60 * 24); // Cache for 24 hours
        
        return allTasks;
      } else {
        logger.warn('No tasks were generated from any areas');
        return this.generateTasksFallback(prompt, languageCode);
      }
    } catch (error) {
      logger.error(`Error in analysis-based task generation: ${(error as Error).message}`);
      return this.generateTasksFallback(prompt, languageCode);
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
   * Fallback method for generating tasks
   * @param prompt The prompt to generate tasks from
   * @param languageCode Optional language code to specify response language
   * @returns The generated tasks
   */
  private async generateTasksFallback(prompt: string, languageCode?: string): Promise<Task[]> {
    try {
      logger.info('Using fallback method for task generation');
      
      // Detect the language of the prompt if not provided
      const detectedLanguage = languageCode || await this.detectLanguage(prompt);
      
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { 
            role: 'system', 
            content: `You are an AI assistant for a todo list application. 
            Generate a structured list of tasks based on the user's prompt.
            The user is writing in ${detectedLanguage} language. Please generate tasks in the same language.
            
            For each task, provide:
            1. A clear, concise title
            2. A detailed description
            3. Priority level (high, medium, or low)
            4. Estimated time to complete
            5. Optional: 2-3 subtasks if applicable
            
            Format your response as a numbered list of tasks with clear sections for each attribute.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      
      // Parse the text response into structured tasks
      const tasks: Task[] = [];
      const taskRegex = /(\d+)[.)]?\s+(.+?)(?=\n\d+[.)]|\n*$)/gs;
      const matches = content.matchAll(taskRegex);
      
      for (const match of matches) {
        const taskContent = match[2].trim();
        
        // Extract task details
        const titleMatch = taskContent.match(/^(.+?)(?:\n|$)/);
        const descriptionMatch = taskContent.match(/Description:?\s*(.+?)(?:\n|$)/i);
        const priorityMatch = taskContent.match(/Priority:?\s*(high|medium|low)/i);
        const timeMatch = taskContent.match(/(?:Estimated )?Time:?\s*(.+?)(?:\n|$)/i);
        
        // Extract subtasks if present
        const subtasks: Subtask[] = [];
        const subtaskRegex = /Subtasks?:?\s*(?:\n|$)((?:.+\n?)+)/i;
        const subtaskMatch = taskContent.match(subtaskRegex);
        
        if (subtaskMatch) {
          const subtaskContent = subtaskMatch[1];
          const subtaskItems = subtaskContent.split(/\n/).filter(item => item.trim());
          
          for (const item of subtaskItems) {
            const cleanItem = item.replace(/^[-*•]\s*/, '').trim();
            if (cleanItem) {
              subtasks.push({
                title: cleanItem,
                description: ''
              });
            }
          }
        }
        
        tasks.push({
          title: titleMatch ? titleMatch[1].trim() : `Task ${tasks.length + 1}`,
          description: descriptionMatch ? descriptionMatch[1].trim() : '',
          priority: (priorityMatch ? priorityMatch[1].toLowerCase() : 'medium') as Priority,
          estimatedTime: timeMatch ? timeMatch[1].trim() : '1 hour',
          subtasks: subtasks.length > 0 ? subtasks : undefined
        });
      }
      
      logger.info(`Generated ${tasks.length} tasks using fallback method`);
      return tasks;
    } catch (error) {
      logger.error(`Error in fallback task generation: ${(error as Error).message}`);
      // Return an empty array if all else fails
      return [];
    }
  }

  /**
   * Process an action based on user prompt
   * @param prompt The user's prompt
   * @param languageCode Optional language code to specify response language
   * @returns The result of the action
   */
  async processAction(prompt: string, languageCode?: string): Promise<{
    message: string;
    action: string;
    success: boolean;
    data?: Record<string, unknown>;
  }> {
    try {
      logger.info(`Processing action for prompt: ${prompt.substring(0, 50)}...`);
      
      // Create a cache key that includes both the prompt and language
      const cacheKey = `action:${languageCode || 'auto'}:${prompt.substring(0, 100)}`;
      
      // Check if we have this action cached
      const cachedAction = await this.getFromCache(cacheKey);
      if (cachedAction) {
        logger.info('Using cached action result');
        return JSON.parse(cachedAction);
      }
      
      // Detect the language of the prompt if not provided
      const detectedLanguage = languageCode || await this.detectLanguage(prompt);
      
      // First, try to determine the action using a rule-based approach
      const { action, parameters } = this.extractActionAndParameters(prompt);
      
      // If rule-based extraction failed, use OpenAI
      if (!action) {
        logger.info('Rule-based action extraction failed, using OpenAI...');
        
        // Determine the appropriate model based on prompt length
        const model = this.getAppropriateModel(prompt.length, false);
        
        // First, analyze the prompt to determine the action
        const analysisResponse = await this.openai.chat.completions.create({
          model,
          messages: [
            { 
              role: 'system', 
              content: `You are an AI assistant for a todo list application. 
              Analyze the user's request and determine what action they want to perform.
              The user is writing in ${detectedLanguage} language.
              Valid actions are: create_task, update_task, delete_task, complete_task, list_tasks, generate_tasks.
              Return ONLY a JSON object with the following structure:
              {
                "action": "the_action_name",
                "parameters": {
                  // Any parameters needed for the action
                }
              }` 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        });

        const analysisContent = analysisResponse.choices[0]?.message?.content || '{}';
        let analysis;
        
        try {
          analysis = JSON.parse(analysisContent);
        } catch (error) {
          logger.error(`Error parsing analysis JSON: ${(error as Error).message}`);
          return {
            message: await this.translateMessage("I couldn't understand how to process your request. Please try again with a clearer instruction.", detectedLanguage),
            action: 'parse_error',
            success: false
          };
        }
        
        // Use the AI-determined action and parameters
        const aiAction = analysis.action;
        const aiParameters = analysis.parameters || {};
        
        // Store the detected language for use in response messages
        aiParameters.languageCode = detectedLanguage;
        
        // Handle the AI-determined action
        const result = await this.handleAction(aiAction, aiParameters);
        
        // Cache the result
        await this.saveToCache(cacheKey, JSON.stringify(result), 60 * 5); // Cache for 5 minutes
        
        return result;
      }
      
      // If rule-based extraction succeeded, use the extracted action and parameters
      logger.info(`Rule-based action extraction succeeded: ${action}`);
      
      // Store the detected language for use in response messages
      parameters.languageCode = detectedLanguage;
      
      // Handle the action
      const result = await this.handleAction(action, parameters);
      
      // Cache the result
      await this.saveToCache(cacheKey, JSON.stringify(result), 60 * 5); // Cache for 5 minutes
      
      return result;
    } catch (error) {
      logger.error(`Error processing action: ${(error as Error).message}`);
      return {
        message: "I encountered an error while processing your request. Please try again later.",
        action: 'error',
        success: false
      };
    }
  }

  /**
   * Extract action and parameters from a prompt using rule-based approach
   * @param prompt The user's prompt
   * @returns The extracted action and parameters
   */
  private extractActionAndParameters(prompt: string): { 
    action: string | null; 
    parameters: Record<string, unknown> 
  } {
    const lowerPrompt = prompt.toLowerCase();
    const parameters: Record<string, unknown> = {};
    
    // Check for create/add task action
    if (/\b(create|add|new)\b.+\b(task|todo|to-do)\b/i.test(prompt)) {
      // Extract task title
      const titleMatch = prompt.match(/\b(task|todo|to-do)\b\s+(?:called|named|titled)?\s*["']?([^"']+)["']?/i) ||
                        prompt.match(/\b(create|add|new)\b\s+(?:a|an)?\s+(?:task|todo|to-do)\s+(?:called|named|titled)?\s*["']?([^"']+)["']?/i);
      
      if (titleMatch) {
        parameters.title = titleMatch[2].trim();
        
        // Try to extract description
        const descMatch = prompt.match(/\bdescription\b\s*(?:is|:)?\s*["']?([^"']+)["']?/i);
        if (descMatch) {
          parameters.description = descMatch[1].trim();
        }
        
        // Try to extract priority
        if (/\bhigh\s+priority\b/i.test(prompt)) {
          parameters.priority = 'high';
        } else if (/\blow\s+priority\b/i.test(prompt)) {
          parameters.priority = 'low';
        } else {
          parameters.priority = 'medium';
        }
        
        return { action: 'create_task', parameters };
      }
    }
    
    // Check for complete/mark task action
    if (/\b(complete|mark|finish)\b.+\b(task|todo|to-do)\b/i.test(prompt)) {
      // Extract task title or ID
      const taskMatch = prompt.match(/\b(task|todo|to-do)\b\s+(?:called|named|titled)?\s*["']?([^"']+)["']?/i);
      
      if (taskMatch) {
        parameters.title = taskMatch[2].trim();
        return { action: 'complete_task', parameters };
      }
    }
    
    // Check for delete/remove task action
    if (/\b(delete|remove)\b.+\b(task|todo|to-do)\b/i.test(prompt)) {
      // Extract task title or ID
      const taskMatch = prompt.match(/\b(task|todo|to-do)\b\s+(?:called|named|titled)?\s*["']?([^"']+)["']?/i);
      
      if (taskMatch) {
        parameters.title = taskMatch[2].trim();
        return { action: 'delete_task', parameters };
      }
    }
    
    // Check for list tasks action
    if (/\b(list|show|display|get)\b.+\b(tasks|todos|to-dos)\b/i.test(prompt)) {
      // Try to extract filters
      if (/\bcompleted\b/i.test(prompt)) {
        parameters.status = 'completed';
      } else if (/\bincomplete\b|\bpending\b|\bnot completed\b/i.test(prompt)) {
        parameters.status = 'incomplete';
      }
      
      if (/\bhigh\s+priority\b/i.test(prompt)) {
        parameters.priority = 'high';
      } else if (/\bmedium\s+priority\b/i.test(prompt)) {
        parameters.priority = 'medium';
      } else if (/\blow\s+priority\b/i.test(prompt)) {
        parameters.priority = 'low';
      }
      
      return { action: 'list_tasks', parameters };
    }
    
    // Check for generate tasks action
    if (/\b(generate|create|make)\b.+\b(tasks|todos|to-dos)\b.+\b(for|about)\b/i.test(prompt)) {
      // Extract the topic
      const topicMatch = prompt.match(/\b(for|about)\b\s+(.+)$/i);
      
      if (topicMatch) {
        parameters.prompt = topicMatch[2].trim();
        return { action: 'generate_tasks', parameters };
      }
    }
    
    // No action detected
    return { action: null, parameters };
  }

  /**
   * Handle an action with the given parameters
   * @param action The action to handle
   * @param parameters The parameters for the action
   * @returns The result of the action
   */
  private async handleAction(action: string, parameters: Record<string, unknown>): Promise<{
    message: string;
    action: string;
    success: boolean;
    data?: Record<string, unknown>;
  }> {
    switch (action) {
      case 'create_task':
        return await this.handleCreateTask(parameters);
      
      case 'update_task':
        return await this.handleUpdateTask(parameters);
      
      case 'delete_task':
        return await this.handleDeleteTask(parameters);
      
      case 'complete_task':
        return await this.handleCompleteTask(parameters);
      
      case 'list_tasks':
        return await this.handleListTasks(parameters);
      
      case 'generate_tasks':
        return await this.handleGenerateTasks(parameters);
      
      default:
        const languageCode = parameters.languageCode as string || 'en';
        return {
          message: await this.translateMessage(`I'm not sure how to perform the action "${action}". Please try a different request.`, languageCode),
          action: 'unknown_action',
          success: false
        };
    }
  }

  /**
   * Handle creating a new task
   */
  private async handleCreateTask(parameters: Record<string, unknown>): Promise<{
    message: string;
    action: string;
    success: boolean;
    data?: Record<string, unknown>;
  }> {
    try {
      // Extract task details from parameters
      const title = parameters.title as string;
      const description = parameters.description as string || '';
      const priority = parameters.priority as string || 'medium';
      const languageCode = parameters.languageCode as string || 'en';
      
      if (!title) {
        return {
          message: await this.translateMessage("I couldn't create the task because I need at least a title. Please provide more details.", languageCode),
          action: 'create_task',
          success: false
        };
      }
      
      // Here you would typically call your todo service to create the task
      // For now, we'll just simulate success
      
      return {
        message: await this.translateMessage(`I've created a new task: "${title}"`, languageCode),
        action: 'create_task',
        success: true,
        data: {
          title,
          description,
          priority,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error(`Error creating task: ${(error as Error).message}`);
      const languageCode = parameters.languageCode as string || 'en';
      return {
        message: await this.translateMessage("I encountered an error while creating the task. Please try again.", languageCode),
        action: 'create_task',
        success: false
      };
    }
  }

  /**
   * Handle updating a task
   */
  private async handleUpdateTask(parameters: Record<string, unknown>): Promise<{
    message: string;
    action: string;
    success: boolean;
    data?: Record<string, unknown>;
  }> {
    // Implementation would connect to your todo service
    const languageCode = parameters.languageCode as string || 'en';
    return {
      message: await this.translateMessage("I've updated the task for you.", languageCode),
      action: 'update_task',
      success: true,
      data: parameters
    };
  }

  /**
   * Handle deleting a task
   */
  private async handleDeleteTask(parameters: Record<string, unknown>): Promise<{
    message: string;
    action: string;
    success: boolean;
    data?: Record<string, unknown>;
  }> {
    // Implementation would connect to your todo service
    const languageCode = parameters.languageCode as string || 'en';
    return {
      message: await this.translateMessage("I've deleted the task for you.", languageCode),
      action: 'delete_task',
      success: true,
      data: parameters
    };
  }

  /**
   * Handle completing a task
   */
  private async handleCompleteTask(parameters: Record<string, unknown>): Promise<{
    message: string;
    action: string;
    success: boolean;
    data?: Record<string, unknown>;
  }> {
    // Implementation would connect to your todo service
    const languageCode = parameters.languageCode as string || 'en';
    return {
      message: await this.translateMessage("I've marked the task as complete.", languageCode),
      action: 'complete_task',
      success: true,
      data: parameters
    };
  }

  /**
   * Handle listing tasks
   */
  private async handleListTasks(parameters: Record<string, unknown>): Promise<{
    message: string;
    action: string;
    success: boolean;
    data?: Record<string, unknown>;
  }> {
    // Implementation would connect to your todo service
    const languageCode = parameters.languageCode as string || 'en';
    return {
      message: await this.translateMessage("Here are your tasks.", languageCode),
      action: 'list_tasks',
      success: true,
      data: {
        tasks: [
          { title: "Sample task 1", completed: false },
          { title: "Sample task 2", completed: true }
        ]
      }
    };
  }

  /**
   * Handle generating tasks
   */
  private async handleGenerateTasks(parameters: Record<string, unknown>): Promise<{
    message: string;
    action: string;
    success: boolean;
    data?: Record<string, unknown>;
  }> {
    try {
      const prompt = parameters.prompt as string || '';
      const languageCode = parameters.languageCode as string || 'en';
      
      if (!prompt) {
        return {
          message: await this.translateMessage("I need more information to generate tasks. Please provide a description of what you're trying to accomplish.", languageCode),
          action: 'generate_tasks',
          success: false
        };
      }
      
      const tasks = await this.generateTasks(prompt, languageCode);
      
      return {
        message: await this.translateMessage(`I've generated ${tasks.length} tasks based on your request.`, languageCode),
        action: 'generate_tasks',
        success: true,
        data: { tasks }
      };
    } catch (error) {
      logger.error(`Error generating tasks: ${(error as Error).message}`);
      const languageCode = parameters.languageCode as string || 'en';
      return {
        message: await this.translateMessage("I encountered an error while generating tasks. Please try again.", languageCode),
        action: 'generate_tasks',
        success: false
      };
    }
  }

  /**
   * Translate a message to the specified language
   * @param message The message to translate
   * @param targetLanguage The target language code
   * @returns The translated message
   */
  private async translateMessage(message: string, targetLanguage: string): Promise<string> {
    // If the target language is English, return the original message
    if (targetLanguage === 'en') {
      return message;
    }
    
    try {
      logger.info(`Translating message to ${targetLanguage}...`);
      
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { 
            role: 'system', 
            content: `You are a translation system. Translate the following text from English to ${targetLanguage}.
            Return ONLY the translated text, nothing else.` 
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const translatedMessage = response.choices[0]?.message?.content || message;
      logger.info('Translation completed successfully');
      
      return translatedMessage;
    } catch (error) {
      logger.error(`Error translating message: ${(error as Error).message}`);
      // Return the original message if translation fails
      return message;
    }
  }
}

export default new OpenAIService(); 