import { Request, Response } from 'express';
import { TodoService } from '../services/todo-service';
import { CreateTodoDto, UpdateTodoDto, GenerateTodosDto } from '../types/todo';
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
   * Get all todos with pagination, sorting, and filtering
   */
  public getAllTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        sortBy, 
        offset, 
        limit, 
        search,
        priority,
        status,
        dateFilter,
        dateRangeStart,
        dateRangeEnd
      } = req.query;
      
      // Validate sortBy parameter if provided
      const validSortOptions = ['newest', 'oldest', 'priority', 'dueDate'];
      const sortOption = typeof sortBy === 'string' && validSortOptions.includes(sortBy) 
        ? sortBy 
        : 'newest'; // Default to newest if invalid or not provided
      
      // Parse pagination parameters
      const offsetValue = typeof offset === 'string' ? parseInt(offset, 10) : 0;
      const limitValue = typeof limit === 'string' ? parseInt(limit, 10) : 100;
      
      // Validate and sanitize search parameter
      const searchValue = typeof search === 'string' ? search.trim() : '';
      
      // Validate priority parameter
      const priorityValue = typeof priority === 'string' && ['low', 'medium', 'high'].includes(priority)
        ? priority
        : '';
      
      // Validate status parameter
      const statusValue = typeof status === 'string' && ['active', 'completed'].includes(status)
        ? status
        : '';
      
      // Validate date filter parameters
      const dateFilterValue = typeof dateFilter === 'string' ? dateFilter.trim() : '';
      const dateRangeStartValue = typeof dateRangeStart === 'string' ? dateRangeStart.trim() : '';
      const dateRangeEndValue = typeof dateRangeEnd === 'string' ? dateRangeEnd.trim() : '';
      
      // Get todos with pagination and filters
      const result = await this.todoService.getAllTodos({
        sortBy: sortOption,
        offset: offsetValue,
        limit: limitValue,
        search: searchValue,
        priority: priorityValue,
        status: statusValue,
        dateFilter: dateFilterValue,
        dateRangeStart: dateRangeStartValue,
        dateRangeEnd: dateRangeEndValue
      });
      
      // Return todos with pagination metadata
      res.status(200).json({
        todos: result.todos,
        pagination: {
          total: result.total,
          offset: offsetValue,
          limit: limitValue,
          hasMore: offsetValue + result.todos.length < result.total
        }
      });
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
   * Generate todos from a text prompt
   */
  public generateTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || prompt.trim() === '') {
        res.status(400).json({ message: 'Prompt is required' });
        return;
      }
      
      logger.info(`Received request to generate todos with prompt: ${prompt.substring(0, 50)}...`);
      const todos = await this.todoService.generateTodos(prompt);
      res.status(201).json(todos);
    } catch (error) {
      logger.error(`Error in generateTodos controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to generate todos', error: (error as Error).message });
    }
  };

  /**
   * Get today's todos
   */
  public getTodayTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.todoService.getTodayTodos();
      
      res.status(200).json({
        todos: result.todos,
        pagination: {
          total: result.total,
          offset: 0,
          limit: result.todos.length,
          hasMore: false
        }
      });
    } catch (error) {
      logger.error(`Error in getTodayTodos controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to get today\'s todos', error: (error as Error).message });
    }
  };

  /**
   * Get upcoming todos
   */
  public getUpcomingTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.todoService.getUpcomingTodos();
      
      res.status(200).json({
        todos: result.todos,
        pagination: {
          total: result.total,
          offset: 0,
          limit: result.todos.length,
          hasMore: false
        }
      });
    } catch (error) {
      logger.error(`Error in getUpcomingTodos controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to get upcoming todos', error: (error as Error).message });
    }
  };

  /**
   * Get dashboard stats
   */
  public getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.todoService.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      logger.error(`Error in getDashboardStats controller: ${(error as Error).message}`);
      res.status(500).json({ message: 'Failed to get dashboard stats', error: (error as Error).message });
    }
  };
} 