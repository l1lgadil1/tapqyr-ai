import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Task, TaskResponse, TaskFetchParams, taskResponseSchema } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'token';

class TaskApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'TaskApiError';
  }
}

/**
 * Create an axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

/**
 * Add request interceptor to include auth token in requests
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handle API response and errors
 */
const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

/**
 * Map and validate task response data
 */
const mapTaskResponse = (data: TaskResponse): Task => {
  try {
    // Handle missing or null data
    if (!data) {
      throw new Error('Task data is null or undefined');
    }
    
    // Ensure required fields exist with fallbacks
    const taskData = {
      id: data.id || `temp-${Date.now()}`,
      title: data.title || 'Untitled Task',
      description: data.description || '',
      completed: typeof data.completed === 'string' 
        ? data.completed === 'true' 
        : Boolean(data.completed),
      priority: data.priority || 'medium',
      estimatedTime: data.estimatedTime || undefined,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    
    // Validate the data against our schema
    try {
      return taskResponseSchema.parse(taskData);
    } catch (zodError) {
      // If validation fails, log the error but return the best data we can
      console.warn('Task validation warning:', zodError);
      return taskData as Task;
    }
  } catch (error) {
    console.error('Task mapping error:', error);
    throw new TaskApiError('Invalid task data received from API', 422, error);
  }
};

/**
 * Handle API errors
 */
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;
    const responseData = axiosError.response?.data;
    
    // Handle specific error cases
    if (statusCode === 401) {
      throw new TaskApiError('Authentication required', statusCode, responseData);
    } else if (statusCode === 403) {
      throw new TaskApiError('You do not have permission to perform this action', statusCode, responseData);
    } else if (statusCode === 404) {
      throw new TaskApiError('The requested resource was not found', statusCode, responseData);
    } else if (statusCode && statusCode >= 400 && statusCode < 500) {
      throw new TaskApiError(`Client error: ${axiosError.message}`, statusCode, responseData);
    } else if (statusCode && statusCode >= 500) {
      throw new TaskApiError(`Server error: ${axiosError.message}`, statusCode, responseData);
    }
    
    throw new TaskApiError(axiosError.message || defaultMessage, statusCode, responseData);
  }
  
  // For non-Axios errors
  throw new TaskApiError(error instanceof Error ? error.message : defaultMessage);
};

export const tasksApi = {
  /**
   * Get tasks with filtering, sorting, and pagination
   */
  async getTasks(params: TaskFetchParams = {}): Promise<{ tasks: Task[]; totalItems: number; hasMore: boolean }> {
    try {
      // Convert params to API format
      const apiParams: Record<string, string | number | boolean | undefined> = {
        ...params,
      };
      
      // Convert page/limit to offset/limit if page is provided
      if (params.page !== undefined) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        apiParams.offset = (page - 1) * limit;
        apiParams.limit = limit;
        
        // Remove page parameter as backend uses offset
        delete apiParams.page;
      }
      
      // Set default limit if not provided
      if (apiParams.limit === undefined) {
        apiParams.limit = 10;
      }
      
      // Set default offset if not provided
      if (apiParams.offset === undefined) {
        apiParams.offset = 0;
      }
      
      // Handle sort parameter
      if (params.sort) {
        apiParams.sortBy = params.sort;
        delete apiParams.sort;
      }
      
      const response = await apiClient.get('/todos', { params: apiParams });
      const data = response.data;
      
      // Safely map tasks with error handling for individual items
      const mappedTasks: Task[] = [];
      for (const todo of (data.todos || [])) {
        try {
          mappedTasks.push(mapTaskResponse(todo));
        } catch (err) {
          console.error('Error mapping task:', err);
          // Skip invalid tasks instead of failing the entire request
        }
      }
      
      return {
        tasks: mappedTasks,
        totalItems: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch tasks');
    }
  },
  
  /**
   * Get a task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await apiClient.get(`/todos/${id}`);
      const data = handleApiResponse<TaskResponse>(response);
      return mapTaskResponse(data);
    } catch (error) {
      return handleApiError(error, `Failed to fetch task with ID ${id}`);
    }
  },
  
  /**
   * Create a new task
   */
  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    try {
      const response = await apiClient.post('/todos', task);
      const data = handleApiResponse<TaskResponse>(response);
      return mapTaskResponse(data);
    } catch (error) {
      return handleApiError(error, 'Failed to create task');
    }
  },
  
  /**
   * Update a task
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await apiClient.put(`/todos/${id}`, updates);
      const data = handleApiResponse<TaskResponse>(response);
      return mapTaskResponse(data);
    } catch (error) {
      return handleApiError(error, `Failed to update task with ID ${id}`);
    }
  },
  
  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      await apiClient.delete(`/todos/${id}`);
    } catch (error) {
      return handleApiError(error, `Failed to delete task with ID ${id}`);
    }
  },
  
  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: string): Promise<Task> {
    try {
      // Use the proper toggle endpoint instead of directly updating
      const response = await apiClient.patch(`/todos/${id}/toggle`);
      const data = handleApiResponse<TaskResponse>(response);
      return mapTaskResponse(data);
    } catch (error) {
      return handleApiError(error, `Failed to toggle completion for task with ID ${id}`);
    }
  },
  
  /**
   * Get tasks due today
   */
  async getTodayTodos(): Promise<{ tasks: Task[]; totalItems: number; hasMore: boolean }> {
    try {
      const response = await apiClient.get('/todos/today');
      const data = response.data;
      
      // Safely map tasks with error handling for individual items
      const mappedTasks: Task[] = [];
      for (const todo of (data.todos || [])) {
        try {
          mappedTasks.push(mapTaskResponse(todo));
        } catch (err) {
          console.error('Error mapping today task:', err);
          // Skip invalid tasks instead of failing the entire request
        }
      }
      
      return {
        tasks: mappedTasks,
        totalItems: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch today\'s tasks');
    }
  },
  
  /**
   * Get upcoming tasks (due after today)
   */
  async getUpcomingTasks(): Promise<{ tasks: Task[]; totalItems: number; hasMore: boolean }> {
    try {
      const response = await apiClient.get('/todos/upcoming');
      const data = response.data;
      
      // Safely map tasks with error handling for individual items
      const mappedTasks: Task[] = [];
      for (const todo of (data.todos || [])) {
        try {
          mappedTasks.push(mapTaskResponse(todo));
        } catch (err) {
          console.error('Error mapping upcoming task:', err);
          // Skip invalid tasks instead of failing the entire request
        }
      }
      
      return {
        tasks: mappedTasks,
        totalItems: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch upcoming tasks');
    }
  },
  
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    totalTodos: number;
    completedTodos: number;
    activeTodos: number;
    todayTodos: number;
    upcomingTodos: number;
    highPriorityTodos: number;
    completionRate: number;
  }> {
    try {
      const response = await apiClient.get('/todos/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return default values on error
      return {
        totalTodos: 0,
        completedTodos: 0,
        activeTodos: 0,
        todayTodos: 0,
        upcomingTodos: 0,
        highPriorityTodos: 0,
        completionRate: 0,
      };
    }
  },
};