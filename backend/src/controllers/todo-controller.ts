import { Request, Response } from 'express';
import { TodoService } from '../services/todo-service';
import { CreateTodoDto, UpdateTodoDto, AIGenerateTodosDto } from '../types/todo';
import logger from '../utils/logger';

/**
 * Controller for handling todo-related HTTP requests
 */
export class TodoController {
  private todoService: TodoService;

  constructor() {
    this.todoService = new TodoService();
  }

  /**
   * Get all todos
   */
  public getAllTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const todos = await this.todoService.getAllTodos();
      res.status(200).json(todos);
    } catch (error) {
      logger.error(`Error in getAllTodos controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to get todos', error: (error as Error).message });
    }
  };

  /**
   * Get a todo by ID
   */
  public getTodoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const todo = await this.todoService.getTodoById(id);
      
      if (!todo) {
        res.status(404).json({ message: `Todo with ID ${id} not found` });
        return;
      }
      
      res.status(200).json(todo);
    } catch (error) {
      logger.error(`Error in getTodoById controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to get todo', error: (error as Error).message });
    }
  };

  /**
   * Create a new todo
   */
  public createTodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const todoDto: CreateTodoDto = req.body;
      
      if (!todoDto.title || todoDto.title.trim() === '') {
        res.status(400).json({ message: 'Title is required' });
        return;
      }
      
      const newTodo = await this.todoService.createTodo(todoDto);
      res.status(201).json(newTodo);
    } catch (error) {
      logger.error(`Error in createTodo controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to create todo', error: (error as Error).message });
    }
  };

  /**
   * Update an existing todo
   */
  public updateTodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const todoDto: UpdateTodoDto = req.body;
      
      const updatedTodo = await this.todoService.updateTodo(id, todoDto);
      
      if (!updatedTodo) {
        res.status(404).json({ message: `Todo with ID ${id} not found` });
        return;
      }
      
      res.status(200).json(updatedTodo);
    } catch (error) {
      logger.error(`Error in updateTodo controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to update todo', error: (error as Error).message });
    }
  };

  /**
   * Delete a todo by ID
   */
  public deleteTodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const isDeleted = await this.todoService.deleteTodo(id);
      
      if (!isDeleted) {
        res.status(404).json({ message: `Todo with ID ${id} not found` });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      logger.error(`Error in deleteTodo controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to delete todo', error: (error as Error).message });
    }
  };

  /**
   * Toggle todo completion status
   */
  public toggleTodoCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedTodo = await this.todoService.toggleTodoCompletion(id);
      
      if (!updatedTodo) {
        res.status(404).json({ message: `Todo with ID ${id} not found` });
        return;
      }
      
      res.status(200).json(updatedTodo);
    } catch (error) {
      logger.error(`Error in toggleTodoCompletion controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to toggle todo completion', error: (error as Error).message });
    }
  };

  /**
   * Generate AI todos based on a prompt
   */
  public generateAITodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt }: AIGenerateTodosDto = req.body;
      
      if (!prompt || prompt.trim() === '') {
        res.status(400).json({ message: 'Prompt is required' });
        return;
      }
      
      logger.info(`Received request to generate AI todos with prompt: ${prompt.substring(0, 50)}...`);
      const aiTodos = await this.todoService.generateAITodos(prompt);
      res.status(201).json(aiTodos);
    } catch (error) {
      logger.error(`Error in generateAITodos controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to generate AI todos', error: (error as Error).message });
    }
  };
} 