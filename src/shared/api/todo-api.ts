import { TodoItem, TodoResponse, todoResponseSchema, TodoFetchParams } from '../../widgets/todo-list/types';
import { z } from 'zod';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'token';

class TodoApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'TodoApiError';
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
 * Map and validate todo response data
 */
const mapTodoResponse = (data: TodoResponse): TodoItem => {
  try {
    // Check if data is null or undefined
    if (!data) {
      console.error('Invalid todo data: Received null or undefined data');
      throw new TodoApiError('Invalid todo data received from server');
    }
    
    // Check if data is an array (which would be invalid for a single todo)
    if (Array.isArray(data)) {
      console.error('Invalid todo data: Array received instead of object', data);
      
      // If it's an array with a single item, try to use that item
      if (data.length === 1 && typeof data[0] === 'object') {
        console.log('Attempting to use first item in array');
        return mapTodoResponse(data[0] as TodoResponse);
      }
      
      throw new TodoApiError('Invalid todo data received from server');
    }
    
    // Ensure data has required fields
    if (!data.id || !data.title) {
      console.error('Invalid todo data: Missing required fields', data);
      throw new TodoApiError('Invalid todo data received from server');
    }
    
    const validatedData = todoResponseSchema.parse(data);
    return {
      id: validatedData.id,
      title: validatedData.title,
      description: validatedData.description || undefined,
      completed: validatedData.completed,
      dueDate: validatedData.dueDate || undefined,
      priority: validatedData.priority,
      createdAt: validatedData.createdAt,
      updatedAt: validatedData.updatedAt,
      isAIGenerated: validatedData.isAIGenerated,
      userId: validatedData.userId
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid todo data:', error.errors);
      throw new TodoApiError('Invalid todo data received from server');
    }
    throw error;
  }
};

/**
 * Handle API errors consistently
 */
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;
    const errorData = axiosError.response?.data;
    const errorMessage = typeof errorData === 'object' && errorData !== null && 'message' in errorData
      ? String(errorData.message)
      : axiosError.message;
    
    throw new TodoApiError(errorMessage, statusCode, errorData);
  }
  
  if (error instanceof TodoApiError) {
    throw error;
  }
  
  console.error(defaultMessage, error);
  throw new TodoApiError(defaultMessage);
};

export const todoApi = {
  /**
   * Get all todos with pagination and filters
   */
  async getTodos(params: TodoFetchParams): Promise<{ todos: TodoItem[]; totalItems: number }> {
    try {
      console.log('Fetching todos with params:', params);
      
      // Create a new params object to avoid modifying the original
      const apiParams = { ...params };
      
      // Format date parameters if they exist
      if (apiParams.dateFilter) {
        // If using a single date filter, ensure it's in the correct format
        apiParams.dateFilter = apiParams.dateFilter.split('T')[0]; // Ensure YYYY-MM-DD format
      }
      
      if (apiParams.dateRangeStart) {
        // Format start date for range filter
        apiParams.dateRangeStart = apiParams.dateRangeStart.split('T')[0];
      }
      
      if (apiParams.dateRangeEnd) {
        // Format end date for range filter
        apiParams.dateRangeEnd = apiParams.dateRangeEnd.split('T')[0];
      }
      
      // Handle date filter types
      if (apiParams.dateFilterType && apiParams.dateFilterType !== 'all' && apiParams.dateFilterType !== 'custom') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
        
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        switch (apiParams.dateFilterType) {
          case 'today':
            apiParams.dateFilter = today.toISOString().split('T')[0];
            break;
          case 'tomorrow':
            apiParams.dateFilter = tomorrow.toISOString().split('T')[0];
            break;
          case 'thisWeek':
            apiParams.dateRangeStart = today.toISOString().split('T')[0];
            apiParams.dateRangeEnd = nextWeekStart.toISOString().split('T')[0];
            break;
          case 'nextWeek':
            apiParams.dateRangeStart = nextWeekStart.toISOString().split('T')[0];
            apiParams.dateRangeEnd = nextWeekEnd.toISOString().split('T')[0];
            break;
          case 'thisMonth':
            apiParams.dateRangeStart = thisMonthStart.toISOString().split('T')[0];
            apiParams.dateRangeEnd = thisMonthEnd.toISOString().split('T')[0];
            break;
        }
        
        // Remove the dateFilterType to avoid sending it to the API
        delete apiParams.dateFilterType;
      }
      
      // Handle overdue tasks
      if (apiParams.isOverdue) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // For overdue tasks, we want all tasks with a due date before today
        apiParams.dateRangeEnd = today.toISOString().split('T')[0];
        
        // We also want to ensure we only get active tasks
        apiParams.status = 'active';
        
        // Remove the isOverdue flag to avoid sending it to the API
        delete apiParams.isOverdue;
      }
      
      // Convert tags array to comma-separated string if it exists
      if (apiParams.tags && Array.isArray(apiParams.tags) && apiParams.tags.length > 0) {
        apiParams.tags = apiParams.tags.join(',');
      }
      
      const response = await apiClient.get('/todos', { params: apiParams });
      const data = response.data;
      
      return {
        todos: data.todos || [],
        totalItems: data.pagination.total || 0,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch todos');
    }
  },
  
  /**
   * Get a todo by ID
   */
  async getTodoById(id: string): Promise<TodoItem> {
    try {
      const response = await apiClient.get(`/todos/${id}`);
      const data = handleApiResponse<TodoResponse>(response);
      return mapTodoResponse(data);
    } catch (error) {
      return handleApiError(error, `Failed to fetch todo with ID ${id}`);
    }
  },
  
  /**
   * Create a new todo
   */
  async createTodo(todo: Omit<TodoItem, 'id' | 'createdAt'>): Promise<TodoItem> {
    try {
      const response = await apiClient.post('/todos', todo);
      const data = handleApiResponse<TodoResponse>(response);
      return mapTodoResponse(data);
    } catch (error) {
      return handleApiError(error, 'Failed to create todo');
    }
  },
  
  /**
   * Update a todo
   */
  async updateTodo(id: string, updates: Partial<TodoItem>): Promise<TodoItem> {
    try {
      const response = await apiClient.put(`/todos/${id}`, updates);
      const data = handleApiResponse<TodoResponse>(response);
      return mapTodoResponse(data);
    } catch (error) {
      return handleApiError(error, `Failed to update todo with ID ${id}`);
    }
  },
  
  /**
   * Delete a todo by ID
   */
  async deleteTodo(id: string): Promise<void> {
    try {
      await apiClient.delete(`/todos/${id}`);
    } catch (error) {
      handleApiError(error, `Failed to delete todo with ID ${id}`);
    }
  },
  
  /**
   * Toggle todo completion status
   */
  async toggleTodoCompletion(id: string): Promise<TodoItem> {
    try {
      const response = await apiClient.patch(`/todos/${id}/toggle`);
      const data = handleApiResponse<TodoResponse>(response);
      return mapTodoResponse(data);
    } catch (error) {
      return handleApiError(error, `Failed to toggle todo completion for ID ${id}`);
    }
  },
  
  /**
   * Generate todos based on a prompt
   */
  async generateTodos(prompt: string): Promise<TodoItem[]> {
    try {
      const response = await apiClient.post('/todos/generate', { prompt });
      const data = handleApiResponse<TodoResponse[]>(response);
      
      return data.map(todo => mapTodoResponse(todo));
    } catch (error) {
      return handleApiError(error, 'Failed to generate todos');
    }
  },

  /**
   * Get today's todos
   */
  async getTodayTodos(): Promise<{ todos: TodoItem[]; totalItems: number }> {
    try {
      const response = await apiClient.get('/todos/today');
      const data = response.data;
      
      return {
        todos: data.todos || [],
        totalItems: data.pagination.total || 0,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch today\'s todos');
    }
  },

  /**
   * Get upcoming todos
   */
  async getUpcomingTodos(): Promise<{ todos: TodoItem[]; totalItems: number }> {
    try {
      const response = await apiClient.get('/todos/upcoming');
      const data = response.data;
      
      return {
        todos: data.todos || [],
        totalItems: data.pagination.total || 0,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch upcoming todos');
    }
  },

  /**
   * Get dashboard stats
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
      return handleApiError(error, 'Failed to fetch dashboard stats');
    }
  },
}; 