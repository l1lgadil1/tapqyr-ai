import { z } from 'zod';

// Base Todo schema
export const todoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  completed: z.boolean(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  isAIGenerated: z.boolean().optional(),
  userId: z.string().optional()
});

// API Response schema
export const todoResponseSchema = todoSchema;

// Infer types from schemas
export type TodoItem = z.infer<typeof todoSchema>;
export type TodoResponse = z.infer<typeof todoResponseSchema>;

// Common types
export type SortType = 'newest' | 'oldest' | 'priority' | 'dueDate';
export type FilterType = 'all' | 'active' | 'completed' | 'ai';
export type PriorityFilter = 'all' | 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'completed' | 'active';
export type DateFilterType = 'all' | 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'custom';

// API types
export interface TodoFetchParams {
  page?: number;
  limit?: number;
  search?: string;
  priority?: string;
  status?: string;
  sort?: string;
  aiFilter?: boolean;
  dateFilter?: string; // Single date filter (YYYY-MM-DD)
  dateRangeStart?: string; // Start date for range filter (YYYY-MM-DD)
  dateRangeEnd?: string; // End date for range filter (YYYY-MM-DD)
  dateFilterType?: DateFilterType; // Type of date filter to apply
  tags?: string[] | string; // Array of tag IDs to filter by or comma-separated string
  assignedTo?: string; // User ID to filter by assignment
  createdBy?: string; // User ID to filter by creator
  isOverdue?: boolean; // Filter for overdue tasks
  isImportant?: boolean; // Filter for important tasks
  sortDirection?: 'asc' | 'desc'; // Sort direction
}

export interface TodoApiResponse {
  todos: TodoResponse[];
  total: number;
}

// Component props
export interface TodoListProps {
  todos: TodoItem[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onSort?: (sortBy: SortType) => void;
  onFilter?: (params: TodoFetchParams) => void;
  compact?: boolean;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onLoadMore?: () => void;
  updatingTodoIds?: Set<string>;
}

export interface TodoItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  isAIGenerated?: boolean;
  isUpdating?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  className?: string;
}

export interface TodoFormProps {
  todo?: TodoItem;
  onSubmit: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => Promise<void>;
  onCancel?: () => void;
  className?: string;
} 