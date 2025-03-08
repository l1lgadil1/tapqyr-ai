import { v4 as uuidv4 } from 'uuid';
import { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo';
import openaiService from './openai-service';
import logger from '../utils/logger';
import prisma from '../utils/prisma';

/**
 * Service for managing todo items using Prisma for persistence
 */
export class TodoService {
  /**
   * Convert Prisma Todo to application Todo
   */
  private convertPrismaTodoToAppTodo(prismaTodo: any): Todo {
    return {
      id: prismaTodo.id,
      title: prismaTodo.title,
      description: prismaTodo.description,
      completed: prismaTodo.completed,
      dueDate: prismaTodo.dueDate,
      priority: prismaTodo.priority as 'low' | 'medium' | 'high',
      createdAt: prismaTodo.createdAt,
      userId: prismaTodo.userId,
      isAIGenerated: prismaTodo.isAIGenerated || false
    };
  }

  /**
   * Get all todos
   */
  public async getAllTodos(): Promise<Todo[]> {
    try {
      const todos = await prisma.todo.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return todos.map(todo => this.convertPrismaTodoToAppTodo(todo));
    } catch (error) {
      logger.error(`Error getting all todos: ${(error as Error).message}`);
      throw new Error(`Failed to get todos: ${(error as Error).message}`);
    }
  }

  /**
   * Get a todo by ID
   */
  public async getTodoById(id: string): Promise<Todo | null> {
    try {
      const todo = await prisma.todo.findUnique({
        where: { id }
      });
      
      if (!todo) {
        return null;
      }
      
      return this.convertPrismaTodoToAppTodo(todo);
    } catch (error) {
      logger.error(`Error getting todo by ID ${id}: ${(error as Error).message}`);
      throw new Error(`Failed to get todo: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new todo
   */
  public async createTodo(todoDto: CreateTodoDto): Promise<Todo> {
    try {
      // Validate priority
      const priority = todoDto.priority || 'medium';
      if (!['low', 'medium', 'high'].includes(priority)) {
        throw new Error(`Invalid priority: ${priority}`);
      }
      
      const newTodo = await prisma.todo.create({
        data: {
          id: uuidv4(),
          title: todoDto.title,
          description: todoDto.description,
          completed: todoDto.completed ?? false,
          priority: priority,
          dueDate: todoDto.dueDate ? new Date(todoDto.dueDate) : null,
          isAIGenerated: todoDto.isAIGenerated ?? false
        }
      });
      
      return this.convertPrismaTodoToAppTodo(newTodo);
    } catch (error) {
      logger.error(`Error creating todo: ${(error as Error).message}`);
      throw new Error(`Failed to create todo: ${(error as Error).message}`);
    }
  }

  /**
   * Update an existing todo
   */
  public async updateTodo(id: string, todoDto: UpdateTodoDto): Promise<Todo | null> {
    try {
      // First check if the todo exists
      const existingTodo = await this.getTodoById(id);
      if (!existingTodo) {
        return null;
      }
      
      // Validate priority if provided
      if (todoDto.priority && !['low', 'medium', 'high'].includes(todoDto.priority)) {
        throw new Error(`Invalid priority: ${todoDto.priority}`);
      }
      
      // Handle dueDate conversion safely
      let dueDate = undefined;
      if (todoDto.dueDate !== undefined) {
        dueDate = todoDto.dueDate ? new Date(todoDto.dueDate) : null;
      }

      const updatedTodo = await prisma.todo.update({
        where: { id },
        data: {
          title: todoDto.title !== undefined ? todoDto.title : undefined,
          description: todoDto.description !== undefined ? todoDto.description : undefined,
          completed: todoDto.completed !== undefined ? todoDto.completed : undefined,
          priority: todoDto.priority !== undefined ? todoDto.priority : undefined,
          dueDate: dueDate
        }
      });
      
      return this.convertPrismaTodoToAppTodo(updatedTodo);
    } catch (error) {
      logger.error(`Error updating todo ${id}: ${(error as Error).message}`);
      throw new Error(`Failed to update todo: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a todo by ID
   */
  public async deleteTodo(id: string): Promise<boolean> {
    try {
      // First check if the todo exists
      const existingTodo = await this.getTodoById(id);
      if (!existingTodo) {
        return false;
      }

      await prisma.todo.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error(`Error deleting todo ${id}: ${(error as Error).message}`);
      throw new Error(`Failed to delete todo: ${(error as Error).message}`);
    }
  }

  /**
   * Toggle todo completion status
   */
  public async toggleTodoCompletion(id: string): Promise<Todo | null> {
    try {
      const todo = await this.getTodoById(id);
      if (!todo) {
        return null;
      }

      const updatedTodo = await prisma.todo.update({
        where: { id },
        data: { completed: !todo.completed }
      });
      
      return this.convertPrismaTodoToAppTodo(updatedTodo);
    } catch (error) {
      logger.error(`Error toggling todo completion ${id}: ${(error as Error).message}`);
      throw new Error(`Failed to toggle todo completion: ${(error as Error).message}`);
    }
  }

  /**
   * Generate AI todos based on a prompt using OpenAI
   */
  public async generateAITodos(prompt: string): Promise<Todo[]> {
    try {
      logger.info(`Generating AI todos for prompt: ${prompt}`);
      
      // Call OpenAI service to generate tasks
      const generatedTasks = await openaiService.generateTasks(prompt);
      
      // Convert the generated tasks to Todo objects and save them to the database
      const aiTodos: Todo[] = [];
      
      for (const task of generatedTasks) {
        // Validate priority
        const priority = task.priority || 'medium';
        if (!['low', 'medium', 'high'].includes(priority)) {
          logger.warn(`Invalid priority from AI: ${priority}, defaulting to 'medium'`);
          task.priority = 'medium';
        }
        
        const dueDate = task.estimatedTime 
          ? new Date(Date.now() + this.parseEstimatedTime(task.estimatedTime)) 
          : null;
          
        const newTodo = await prisma.todo.create({
          data: {
            id: uuidv4(),
            title: task.title,
            description: task.description,
            priority: task.priority as 'low' | 'medium' | 'high',
            completed: task.completed || false,
            dueDate: dueDate,
            isAIGenerated: true // Mark as AI-generated
          }
        });
        
        aiTodos.push(this.convertPrismaTodoToAppTodo(newTodo));
      }
      
      logger.info(`Successfully generated ${aiTodos.length} AI todos`);
      return aiTodos;
    } catch (error) {
      logger.error(`Error generating AI todos: ${(error as Error).message}`);
      throw new Error(`Failed to generate AI todos: ${(error as Error).message}`);
    }
  }
  
  /**
   * Parse estimated time string to milliseconds
   * Handles formats like "30 minutes", "2 hours", "1 day", etc.
   */
  private parseEstimatedTime(timeString: string): number {
    const lowerTimeString = timeString.toLowerCase();
    
    // Default to 1 day if we can't parse
    let milliseconds = 24 * 60 * 60 * 1000;
    
    if (lowerTimeString.includes('minute')) {
      const minutes = parseInt(lowerTimeString.replace(/[^0-9]/g, '')) || 30;
      milliseconds = minutes * 60 * 1000;
    } else if (lowerTimeString.includes('hour')) {
      const hours = parseInt(lowerTimeString.replace(/[^0-9]/g, '')) || 1;
      milliseconds = hours * 60 * 60 * 1000;
    } else if (lowerTimeString.includes('day')) {
      const days = parseInt(lowerTimeString.replace(/[^0-9]/g, '')) || 1;
      milliseconds = days * 24 * 60 * 60 * 1000;
    } else if (lowerTimeString.includes('week')) {
      const weeks = parseInt(lowerTimeString.replace(/[^0-9]/g, '')) || 1;
      milliseconds = weeks * 7 * 24 * 60 * 60 * 1000;
    }
    
    return milliseconds;
  }
} 