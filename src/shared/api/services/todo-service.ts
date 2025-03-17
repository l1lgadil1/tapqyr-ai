import { apiClient } from '../core/api-client';
import { 
  TodoItem, 
  TodoFetchParams, 
  TodosResponse,
  CreateTodoRequest,
  UpdateTodoRequest
} from '../types/todo';

/**
 * Todo service for handling todo-related operations
 */
export const todoService = {
  /**
   * Get todos with filtering and pagination
   */
  async getTodos(params: TodoFetchParams): Promise<TodosResponse> {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.priority && params.priority !== 'all') queryParams.set('priority', params.priority);
    if (params.status && params.status !== 'all') queryParams.set('status', params.status);
    if (params.sort && params.sort !== 'newest') queryParams.set('sort', params.sort);
    if (params.aiFilter) queryParams.set('aiFilter', 'true');
    
    const url = `/todos?${queryParams.toString()}`;
    return apiClient.get<TodosResponse>(url);
  },

  /**
   * Get a todo by ID
   */
  async getTodoById(id: string): Promise<TodoItem> {
    return apiClient.get<TodoItem>(`/todos/${id}`);
  },

  /**
   * Create a new todo
   */
  async createTodo(todo: CreateTodoRequest): Promise<TodoItem> {
    return apiClient.post<TodoItem>('/todos', todo);
  },

  /**
   * Update a todo
   */
  async updateTodo(id: string, updates: UpdateTodoRequest): Promise<TodoItem> {
    return apiClient.patch<TodoItem>(`/todos/${id}`, updates);
  },

  /**
   * Delete a todo
   */
  async deleteTodo(id: string): Promise<void> {
    await apiClient.delete<void>(`/todos/${id}`);
  },

  /**
   * Toggle todo completion status
   */
  async toggleTodoCompletion(id: string): Promise<TodoItem> {
    return apiClient.post<TodoItem>(`/todos/${id}/toggle`, {});
  },

  /**
   * Generate AI todos based on a prompt
   */
  async generateAITodos(prompt: string): Promise<TodoItem[]> {
    return apiClient.post<TodoItem[]>('/todos/generate', { prompt });
  }
}; 