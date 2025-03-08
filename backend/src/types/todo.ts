/**
 * Todo entity type definitions
 */

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: Date | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  userId?: string | null; // For future authentication implementation
  isAIGenerated?: boolean;
}

export interface CreateTodoDto {
  title: string;
  description?: string | null;
  completed?: boolean;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high';
  isAIGenerated?: boolean;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string | null;
  completed?: boolean;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high';
  isAIGenerated?: boolean;
}

export interface AIGenerateTodosDto {
  prompt: string;
} 