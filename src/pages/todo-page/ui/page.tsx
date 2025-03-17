'use client';

import { Link, useSearchParams } from 'react-router-dom';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../../shared/lib/i18n';
import { TodoList } from '../../../widgets/todo-list/ui/todo-list';
import { TodoFetchParams, TodoItem } from '../../../widgets/todo-list/types';
import { todoApi } from '../../../shared/api/todo-api';
import { toast } from '../../../shared/ui/use-toast';
import { TodoFilters } from '../components/todo-filters';
import { DateFilterType, FilterPriority, FilterStatus, SortOption } from '../types';
import { Tabs, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

export const TodoPage = () => {
  const { t } = useTranslation('todo');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for todos
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isInitialFetchDone = useRef(false);
  
  // Get filter params from URL
  const status = searchParams.get('status') || 'all';
  const priority = searchParams.get('priority') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const aiFilter = searchParams.get('ai') === 'true';
  const dateFilterType = (searchParams.get('dateFilterType') as DateFilterType) || 'all';
  const dateFilter = searchParams.get('dateFilter') || undefined;
  const dateRangeStart = searchParams.get('dateRangeStart') || undefined;
  const dateRangeEnd = searchParams.get('dateRangeEnd') || undefined;
  const isOverdue = searchParams.get('isOverdue') === 'true';
  const isImportant = searchParams.get('isImportant') === 'true';
  const assignedTo = searchParams.get('assignedTo') || undefined;
  const createdBy = searchParams.get('createdBy') || undefined;
  const tags = searchParams.get('tags') ? searchParams.get('tags')?.split(',') : undefined;
  const search = searchParams.get('search') || undefined;
  const sortDirection = (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc';
  
  // Store current query params in a ref to avoid dependency cycles
  const queryParamsRef = useRef<TodoFetchParams>({
    status,
    priority,
    sort,
    aiFilter,
    page: currentPage,
    limit: 10,
    dateFilterType,
    dateFilter,
    dateRangeStart,
    dateRangeEnd,
    isOverdue,
    isImportant,
    assignedTo,
    createdBy,
    tags,
    search,
    sortDirection
  });
  
  // Update ref when params change
  useEffect(() => {
    queryParamsRef.current = {
      status,
      priority,
      sort,
      aiFilter,
      page: currentPage,
      limit: 10,
      dateFilterType,
      dateFilter,
      dateRangeStart,
      dateRangeEnd,
      isOverdue,
      isImportant,
      assignedTo,
      createdBy,
      tags,
      search,
      sortDirection
    };
  }, [
    status, 
    priority, 
    sort, 
    aiFilter, 
    currentPage, 
    dateFilterType, 
    dateFilter, 
    dateRangeStart, 
    dateRangeEnd, 
    isOverdue, 
    isImportant, 
    assignedTo, 
    createdBy, 
    tags, 
    search, 
    sortDirection
  ]);

  // Fetch todos function
  const fetchTodos = useCallback(async (page = 1, append = false) => {
    try {
      console.log('Starting to fetch todos, page:', page, 'append:', append);
      setIsLoading(true);
      setError(null);
      
      const params = {
        ...queryParamsRef.current,
        page
      };
      
      console.log('Fetching with params:', params);
      
      const response = await todoApi.getTodos(params);
      console.log('API response:', response);
      
      if (append) {
        setTodos(prev => [...prev, ...response.todos]);
      } else {
        setTodos(response.todos);
      }
      
      setTotalItems(response.totalItems);
      setHasMore(response.todos.length === queryParamsRef.current.limit);
      setCurrentPage(page);
      isInitialFetchDone.current = true;
      console.log('Fetch completed successfully');
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
      console.error('Failed to fetch todos:', err);
      // Display error in UI
      toast({
        title: 'Error loading todos',
        description: err instanceof Error ? err.message : 'Failed to fetch todos',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies to avoid infinite loops

  // Initial fetch - only run once when component mounts
  useEffect(() => {
    console.log('Initial fetch effect running, isInitialFetchDone:', isInitialFetchDone.current);
    if (!isInitialFetchDone.current) {
      fetchTodos(1, false);
    }
  }, [fetchTodos]);
  
  // Handle filter changes
  useEffect(() => {
    console.log('Filter change effect running, isInitialFetchDone:', isInitialFetchDone.current);
    if (isInitialFetchDone.current) {
      fetchTodos(1, false);
    }
  }, [
    status, 
    priority, 
    sort, 
    aiFilter, 
    dateFilterType, 
    dateFilter, 
    dateRangeStart, 
    dateRangeEnd, 
    isOverdue, 
    isImportant, 
    assignedTo, 
    createdBy, 
    tags, 
    search, 
    sortDirection, 
    fetchTodos
  ]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchTodos(currentPage + 1, true);
    }
  }, [fetchTodos, isLoading, hasMore, currentPage]);

  // Update URL parameters
  const updateURLParams = useCallback((newParams: Partial<TodoFetchParams>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          } else {
            params.delete(key);
          }
        } else if (typeof value === 'boolean') {
          params.set(key, value.toString());
        } else if (value === 'all' || value === '' || value === 'newest' && key === 'sort') {
          params.delete(key);
        } else {
          params.set(key, value.toString());
        }
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
  }, [setSearchParams]);

  // Handle todo actions
  const handleToggleComplete = useCallback(async (id: string) => {
    try {
      // Find the todo to toggle
      const todoToToggle = todos.find(todo => todo.id === id);
      if (!todoToToggle) return;
      
      // Optimistically update the UI
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
      
      // Make the API call
      await todoApi.toggleTodoCompletion(id);
      
      toast({
        title: t('notifications.taskUpdated'),
        description: t('notifications.taskStatusChanged')
      });
    } catch (err) {
      // Revert the optimistic update on error by refetching
      fetchTodos(currentPage, false);
      
      toast({
        title: t('notifications.error'),
        description: err instanceof Error ? err.message : t('notifications.failedToUpdateTask'),
        variant: 'destructive'
      });
    }
  }, [t, todos, fetchTodos, currentPage]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      // Optimistically update the UI
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      setTotalItems(prev => prev - 1);
      
      // Make the API call
      await todoApi.deleteTodo(id);
      
      toast({
        title: t('notifications.taskDeleted'),
        description: t('notifications.taskDeletedSuccess')
      });
    } catch (err) {
      // Revert the optimistic update on error by refetching
      fetchTodos(currentPage, false);
      
      toast({
        title: t('notifications.error'),
        description: err instanceof Error ? err.message : t('notifications.failedToDeleteTask'),
        variant: 'destructive'
      });
    }
  }, [t, fetchTodos, currentPage]);

  const handleEdit = useCallback(async (id: string, updates: Partial<TodoItem> = {}) => {
    try {
      // Find the todo to edit
      const todoToEdit = todos.find(todo => todo.id === id);
      if (!todoToEdit) return;
      
      // Optimistically update the UI
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? { ...todo, ...updates } : todo
        )
      );
      
      // Make the API call
      await todoApi.updateTodo(id, updates);
      
      toast({
        title: t('notifications.taskUpdated'),
        description: t('notifications.taskUpdateSuccess')
      });
    } catch (err) {
      // Revert the optimistic update on error by refetching
      fetchTodos(currentPage, false);
      
      toast({
        title: t('notifications.error'),
        description: err instanceof Error ? err.message : t('notifications.failedToUpdateTask'),
        variant: 'destructive'
      });
    }
  }, [t, todos, fetchTodos, currentPage]);

  // State for advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Toggle advanced filters
  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  // Update filter handlers
  const handleFilterStatusChange = useCallback((status: string) => {
    updateURLParams({ status });
  }, [updateURLParams]);

  const handleFilterPriorityChange = useCallback((priority: string) => {
    updateURLParams({ priority });
  }, [updateURLParams]);

  const handleSortChange = useCallback((sort: string) => {
    updateURLParams({ sort });
  }, [updateURLParams]);

  const handleDateFilterTypeChange = useCallback((dateFilterType: DateFilterType) => {
    updateURLParams({ dateFilterType });
  }, [updateURLParams]);

  const handleDateFilterChange = useCallback((dateFilter?: string) => {
    updateURLParams({ dateFilter });
  }, [updateURLParams]);

  const handleIsOverdueChange = useCallback((isOverdue: boolean) => {
    updateURLParams({ isOverdue });
  }, [updateURLParams]);

  const handleIsImportantChange = useCallback((isImportant: boolean) => {
    updateURLParams({ isImportant });
  }, [updateURLParams]);

  const handleSortDirectionChange = useCallback((sortDirection: 'asc' | 'desc') => {
    updateURLParams({ sortDirection });
  }, [updateURLParams]);

  // Add fallback UI for errors
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive rounded-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-destructive">Error loading todos</h2>
          <p>{error}</p>
          <button 
            onClick={() => fetchTodos(1, false)}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Tabs defaultValue="todo" className="w-full mb-6">
        <TabsList className="grid grid-cols-2 w-full max-w-2xl mx-auto glass-panel border-primary/20 mb-6">
          <TabsTrigger value="dashboard" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </TabsTrigger>
          <TabsTrigger value="todo" asChild>
            <Link to="/todo">All Tasks</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <TodoFilters
        sortBy={sort as SortOption}
        filterPriority={priority as FilterPriority}
        filterStatus={status as FilterStatus}
        dateFilterType={dateFilterType}
        dateFilter={dateFilter}
        isOverdue={isOverdue}
        isImportant={isImportant}
        sortDirection={sortDirection}
        setSortBy={handleSortChange}
        setFilterPriority={handleFilterPriorityChange}
        setFilterStatus={handleFilterStatusChange}
        setDateFilterType={handleDateFilterTypeChange}
        setDateFilter={handleDateFilterChange}
        setIsOverdue={handleIsOverdueChange}
        setIsImportant={handleIsImportantChange}
        setSortDirection={handleSortDirectionChange}
        isLoading={isLoading}
        showAdvancedFilters={showAdvancedFilters}
        toggleAdvancedFilters={toggleAdvancedFilters}
      />
      
      <TodoList
        todos={todos}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onEdit={handleEdit}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        totalItems={totalItems}
        onLoadMore={handleLoadMore}
        onFilter={updateURLParams}
      />
    </div>
  );
} 