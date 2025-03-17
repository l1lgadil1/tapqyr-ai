/**
 * Types for the Todo page components
 */

// Import TodoItem type from widgets
import { TodoItem } from '../../../widgets/todo-list/types';

// Filter types
export type FilterPriority = 'all' | 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'completed' | 'active';
export type SortOption = 'newest' | 'oldest' | 'priority' | 'dueDate';

// Tab values
export type TabValue = 'dashboard' | 'all' | 'today' | 'upcoming';

// Todo fetch params
export interface TodoFetchParams {
  sortBy: SortOption;
  offset: number;
  limit: number;
  search?: string;
  priority?: string;
  status?: string;
  isAIGenerated?: boolean;
}

// Todo API response
export interface TodoApiResponse {
  todos: TodoItem[];
  pagination: {
    total: number;
    hasMore: boolean;
  };
}

// Re-export TodoItem for convenience
export type { TodoItem }; 