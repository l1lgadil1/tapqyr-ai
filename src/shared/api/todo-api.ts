import { Todo } from '../../widgets/todo-list';

const API_URL = 'http://localhost:3001/api';

/**
 * Interface for the Todo API response
 */
interface TodoResponse {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  isAIGenerated?: boolean;
}

/**
 * Convert API response to frontend Todo model
 */
function mapTodoResponse(todo: TodoResponse): Todo {
  return {
    ...todo,
    createdAt: new Date(todo.createdAt),
    dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
  };
}

/**
 * API service for interacting with the Todo backend
 */
export const todoApi = {
  /**
   * Get all todos
   */
  async getAllTodos(): Promise<Todo[]> {
    try {
      const response = await fetch(`${API_URL}/todos`);
      
      if (!response.ok) {
        throw new Error(`Error fetching todos: ${response.statusText}`);
      }
      
      const data: TodoResponse[] = await response.json();
      return data.map(mapTodoResponse);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      throw error;
    }
  },
  
  /**
   * Get a todo by ID
   */
  async getTodoById(id: string): Promise<Todo> {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching todo: ${response.statusText}`);
      }
      
      const data: TodoResponse = await response.json();
      return mapTodoResponse(data);
    } catch (error) {
      console.error(`Failed to fetch todo with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new todo
   */
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating todo: ${response.statusText}`);
      }
      
      const data: TodoResponse = await response.json();
      return mapTodoResponse(data);
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing todo
   */
  async updateTodo(id: string, todo: Partial<Omit<Todo, 'id' | 'createdAt'>>): Promise<Todo> {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating todo: ${response.statusText}`);
      }
      
      const data: TodoResponse = await response.json();
      return mapTodoResponse(data);
    } catch (error) {
      console.error(`Failed to update todo with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a todo by ID
   */
  async deleteTodo(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting todo: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to delete todo with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Toggle todo completion status
   */
  async toggleTodoCompletion(id: string): Promise<Todo> {
    try {
      const response = await fetch(`${API_URL}/todos/${id}/toggle`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`Error toggling todo completion: ${response.statusText}`);
      }
      
      const data: TodoResponse = await response.json();
      return mapTodoResponse(data);
    } catch (error) {
      console.error(`Failed to toggle todo completion for ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Generate AI todos based on a prompt
   */
  async generateAITodos(prompt: string): Promise<Todo[]> {
    try {
      const response = await fetch(`${API_URL}/todos/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating AI todos: ${response.statusText}`);
      }
      
      const data: TodoResponse[] = await response.json();
      return data.map(todo => mapTodoResponse({
        ...todo,
        isAIGenerated: true
      }));
    } catch (error) {
      console.error('Failed to generate AI todos:', error);
      throw error;
    }
  },
}; 