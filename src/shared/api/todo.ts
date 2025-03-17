import { TodoItem, TodoFetchParams } from '../../widgets/todo-list/types';

interface TodoResponse {
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

/**
 * Convert API response to TodoItem
 */
function convertToTodoItem(todo: TodoResponse): TodoItem {
  return todo;
}

/**
 * Fetch todos with filters and pagination
 */
export async function fetchTodos(params: TodoFetchParams): Promise<{ todos: TodoItem[]; total: number }> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.search) queryParams.set('search', params.search);
  if (params.priority && params.priority !== 'all') queryParams.set('priority', params.priority);
  if (params.status && params.status !== 'all') queryParams.set('status', params.status);
  if (params.sort && params.sort !== 'newest') queryParams.set('sort', params.sort);
  if (params.aiFilter) queryParams.set('aiFilter', 'true');
  
  const response = await fetch(`/api/todos?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  
  const data = await response.json();
  
  // Convert response to TodoItem
  const todos = data.todos.map((todo: TodoResponse) => convertToTodoItem(todo));
  
  return { todos, total: data.total };
}

/**
 * Toggle todo completion status
 */
export async function toggleTodo(id: string): Promise<TodoItem> {
  const response = await fetch(`/api/todos/${id}/toggle`, {
    method: 'PATCH'
  });
  
  if (!response.ok) {
    throw new Error('Failed to toggle todo');
  }
  
  const todo: TodoResponse = await response.json();
  
  return convertToTodoItem(todo);
}

/**
 * Delete todo
 */
export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
}

/**
 * Update todo
 */
export async function updateTodo(id: string, data: Partial<TodoItem>): Promise<TodoItem> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  
  const todo: TodoResponse = await response.json();
  
  return convertToTodoItem(todo);
} 