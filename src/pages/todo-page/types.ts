import { z } from 'zod';

// Common types for the Todo page
export type SortOption = 'newest' | 'oldest' | 'priority' | 'dueDate';
export type FilterStatus = 'all' | 'active' | 'completed';
export type FilterPriority = 'all' | 'low' | 'medium' | 'high';
export type DateFilterType = 'all' | 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'custom';

// Validation schemas
export const todoFilterSchema = z.object({
  status: z.enum(['all', 'active', 'completed']).optional().default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high']).optional().default('all'),
  sort: z.enum(['newest', 'oldest', 'priority', 'dueDate']).optional().default('newest'),
  dateFilterType: z.enum(['all', 'today', 'tomorrow', 'thisWeek', 'nextWeek', 'thisMonth', 'custom']).optional().default('all'),
  dateFilter: z.string().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  isOverdue: z.boolean().optional().default(false),
  isImportant: z.boolean().optional().default(false),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10)
}); 