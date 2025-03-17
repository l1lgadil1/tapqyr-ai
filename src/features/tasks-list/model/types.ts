import { z } from 'zod';

// Base Task schema
export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimatedTime: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// API Response schema
export const taskResponseSchema = taskSchema;

// Infer types from schemas
export type Task = z.infer<typeof taskSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;

// Common types
export type SortType = 'newest' | 'oldest' | 'priority' | 'estimatedTime';
export type FilterType = 'all' | 'active' | 'completed';
export type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

// API types
export interface TaskFetchParams {
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
  priority?: string;
  status?: string;
  sort?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  dateFilter?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export interface TaskApiResponse {
  tasks: TaskResponse[];
  total: number;
}

// Component props
export interface TasksListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onSort?: (sortBy: SortType) => void;
  onFilter?: (params: TaskFetchParams) => void;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onLoadMore?: () => void;
  updatingTaskIds?: Set<string>;
}

export interface TaskItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  isUpdating?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  className?: string;
}

// Layout props
export interface TasksListLayoutProps {
  header: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Search props
export interface TasksSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

// Sort props
export interface TasksSortProps {
  value: SortType;
  onChange: (value: SortType) => void;
  className?: string;
}

// Filter props
export interface TasksFilterProps {
  statusFilter: FilterType;
  priorityFilter: PriorityFilter;
  onStatusFilterChange: (value: FilterType) => void;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  onClearFilters: () => void;
  className?: string;
} 