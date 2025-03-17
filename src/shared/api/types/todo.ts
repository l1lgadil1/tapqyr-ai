/**
 * Todo related types
 */

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  isAIGenerated?: boolean;
  userId: string;
}

export interface TodoFetchParams {
  page?: number;
  limit?: number;
  search?: string;
  priority?: 'all' | 'low' | 'medium' | 'high';
  status?: 'all' | 'completed' | 'active';
  sort?: 'newest' | 'oldest' | 'dueDate' | 'priority';
  aiFilter?: boolean;
}

export interface TodosResponse {
  todos: TodoItem[];
  total: number;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
} 