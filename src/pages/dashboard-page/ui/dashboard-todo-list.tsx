'use client';

import { TodoItem } from '../../../widgets/todo-list/types';
import { Card, CardContent, CardHeader } from '../../../shared/ui/card';
import { CheckCircle, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
import { useTranslation } from '../../../shared/lib/i18n';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/ui/dropdown-menu';

interface DashboardTodoListProps {
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  emptyMessage: string;
  viewAllLink: string;
  viewAllLabel: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (priority: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

/**
 * Dashboard Todo List Component
 * Displays a simplified list of todos for the dashboard
 */
export function DashboardTodoList({
  todos,
  isLoading,
  error,
  totalItems,
  emptyMessage,
  viewAllLink,
  viewAllLabel,
  hasMore = false,
  onLoadMore,
  searchQuery = '',
  onSearchChange,
  priorityFilter = '',
  onPriorityFilterChange,
  statusFilter = '',
  onStatusFilterChange,
}: DashboardTodoListProps) {
  const { t } = useTranslation(['todo', 'common']);
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Set up intersection observer for infinite scrolling with more conservative settings
  const { ref, inView } = useInView({
    threshold: 0.5, // Increase threshold to require more visibility
    triggerOnce: false,
    rootMargin: '100px', // Only trigger when element is 100px from viewport
    // Only observe if we have more items to load and we're not currently loading
    skip: !hasMore || isLoading || todos.length === 0
  });
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
  };
  
  // Debounce search with useEffect
  useEffect(() => {
    if (!onSearchChange) return;
    
    const timer = setTimeout(() => {
      // Only trigger search if the query has actually changed
      if (localSearchQuery !== searchQuery) {
        try {
          // If search is empty or only whitespace, pass empty string
          const trimmedQuery = (localSearchQuery || '').trim();
          onSearchChange(trimmedQuery);
        } catch (error) {
          console.error('Error in search handler:', error);
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localSearchQuery, searchQuery, onSearchChange]);
  
  // Load more todos when the user scrolls to the bottom - with debounce
  useEffect(() => {
    if (!inView || !hasMore || !onLoadMore || isLoading) return;
    
    // Add debounce to prevent multiple calls
    const timer = setTimeout(() => {
      onLoadMore();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inView, hasMore, onLoadMore, isLoading]);
  
  // Update local search query when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Loading state
  if (isLoading && !todos.length) {
    return (
      <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-muted animate-pulse"></div>
                <div className="h-4 w-full max-w-[200px] bg-muted animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Search and filter UI
  const renderSearchAndFilters = () => (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchTodos', { defaultValue: 'Search todos...' })}
            className="pl-8"
            value={localSearchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('filters', { defaultValue: 'Filters' })}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">{t('priority', { defaultValue: 'Priority' })}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onPriorityFilterChange?.('')} className={!priorityFilter ? 'bg-accent/50' : ''}>
                {t('all', { defaultValue: 'All' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityFilterChange?.('high')} className={priorityFilter === 'high' ? 'bg-accent/50' : ''}>
                {t('high', { defaultValue: 'High' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityFilterChange?.('medium')} className={priorityFilter === 'medium' ? 'bg-accent/50' : ''}>
                {t('medium', { defaultValue: 'Medium' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityFilterChange?.('low')} className={priorityFilter === 'low' ? 'bg-accent/50' : ''}>
                {t('low', { defaultValue: 'Low' })}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">{t('status', { defaultValue: 'Status' })}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onStatusFilterChange?.('')} className={!statusFilter ? 'bg-accent/50' : ''}>
                {t('all', { defaultValue: 'All' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange?.('active')} className={statusFilter === 'active' ? 'bg-accent/50' : ''}>
                {t('active', { defaultValue: 'Active' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange?.('completed')} className={statusFilter === 'completed' ? 'bg-accent/50' : ''}>
                {t('completed', { defaultValue: 'Completed' })}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Active filters display */}
      {(priorityFilter || statusFilter) && (
        <div className="flex flex-wrap gap-2">
          {priorityFilter && (
            <div className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {t('priority', { defaultValue: 'Priority' })}: {t(priorityFilter, { defaultValue: priorityFilter })}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-transparent" 
                onClick={() => onPriorityFilterChange?.('')}
              >
                <span className="sr-only">{t('clear', { defaultValue: 'Clear' })}</span>
                <span aria-hidden="true">×</span>
              </Button>
            </div>
          )}
          {statusFilter && (
            <div className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {t('status', { defaultValue: 'Status' })}: {t(statusFilter, { defaultValue: statusFilter })}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-transparent" 
                onClick={() => onStatusFilterChange?.('')}
              >
                <span className="sr-only">{t('clear', { defaultValue: 'Clear' })}</span>
                <span aria-hidden="true">×</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Empty state
  if (!todos.length) {
    return (
      <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-0">
          {renderSearchAndFilters()}
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">{emptyMessage}</p>
            <Link
              to={viewAllLink}
              className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {viewAllLabel}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Todos list
  return (
    <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-0">
        {renderSearchAndFilters()}
      </CardHeader>
      <CardContent className="p-4">
        <div className="max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-18rem)] md:max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-start gap-3 pb-3 border-b border-border/30 last:border-0 last:pb-0">
                <div className="mt-0.5">
                  {todo.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className={`h-5 w-5 ${getPriorityColor(todo.priority)}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/todo/${todo.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                    {todo.title}
                  </Link>
                  {todo.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('dueDate')}: {formatDate(todo.dueDate)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Loading indicator for infinite scroll */}
        {isLoading && todos.length > 0 && (
          <div className="py-4 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        )}
        
        {/* Intersection observer target element */}
        {hasMore && !isLoading && (
          <div ref={ref} className="h-4 w-full" />
        )}
        
        {/* View all link */}
        {totalItems > todos.length && !hasMore && (
          <div className="mt-4 text-center">
            <Link
              to={viewAllLink}
              className="text-sm text-primary hover:underline"
            >
              {t('viewMore', { count: totalItems - todos.length })}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Get color class based on priority
 */
function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-blue-500';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (err) {
    console.error('Invalid date format:', dateString, err);
    return dateString;
  }
} 