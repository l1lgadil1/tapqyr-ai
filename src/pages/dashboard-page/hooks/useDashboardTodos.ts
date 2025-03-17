'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { TodoItem, TodoFetchParams } from '../../../widgets/todo-list/types';
import { todoApi } from '../../../shared/api/todo-api';

// Constants
const ITEMS_PER_PAGE = 10;

interface UseDashboardTodosReturn {
  todayTodos: {
    items: TodoItem[];
    isLoading: boolean;
    error: string | null;
    totalItems: number;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    priorityFilter: string;
    setPriorityFilter: (priority: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
  };
  upcomingTodos: {
    items: TodoItem[];
    isLoading: boolean;
    error: string | null;
    totalItems: number;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    priorityFilter: string;
    setPriorityFilter: (priority: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
  };
  stats: {
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing dashboard todos
 */
export function useDashboardTodos(): UseDashboardTodosReturn {
  // Today's todos state
  const [todayTodos, setTodayTodos] = useState<TodoItem[]>([]);
  const [todayTodosLoading, setTodayTodosLoading] = useState(false);
  const [todayTodosError, setTodayTodosError] = useState<string | null>(null);
  const [todayTodosTotal, setTodayTodosTotal] = useState(0);
  const [todayTodosPage, setTodayTodosPage] = useState(1);
  const [todayTodosHasMore, setTodayTodosHasMore] = useState(false);
  const [todayTodosSearch, setTodayTodosSearch] = useState('');
  const [todayTodosPriority, setTodayTodosPriority] = useState('');
  const [todayTodosStatus, setTodayTodosStatus] = useState('');

  // Upcoming todos state
  const [upcomingTodos, setUpcomingTodos] = useState<TodoItem[]>([]);
  const [upcomingTodosLoading, setUpcomingTodosLoading] = useState(false);
  const [upcomingTodosError, setUpcomingTodosError] = useState<string | null>(null);
  const [upcomingTodosTotal, setUpcomingTodosTotal] = useState(0);
  const [upcomingTodosPage, setUpcomingTodosPage] = useState(1);
  const [upcomingTodosHasMore, setUpcomingTodosHasMore] = useState(false);
  const [upcomingTodosSearch, setUpcomingTodosSearch] = useState('');
  const [upcomingTodosPriority, setUpcomingTodosPriority] = useState('');
  const [upcomingTodosStatus, setUpcomingTodosStatus] = useState('');

  // Use refs to break circular dependencies
  const todayTodosRef = useRef(todayTodos);
  const upcomingTodosRef = useRef(upcomingTodos);
  const todayTodosPageRef = useRef(todayTodosPage);
  const upcomingTodosPageRef = useRef(upcomingTodosPage);
  const todayTodosLoadingRef = useRef(todayTodosLoading);
  const upcomingTodosLoadingRef = useRef(upcomingTodosLoading);
  const todayTodosTotalRef = useRef(todayTodosTotal);
  const upcomingTodosTotalRef = useRef(upcomingTodosTotal);

  // Update refs when state changes
  useEffect(() => {
    todayTodosRef.current = todayTodos;
    upcomingTodosRef.current = upcomingTodos;
    todayTodosPageRef.current = todayTodosPage;
    upcomingTodosPageRef.current = upcomingTodosPage;
    todayTodosLoadingRef.current = todayTodosLoading;
    upcomingTodosLoadingRef.current = upcomingTodosLoading;
    todayTodosTotalRef.current = todayTodosTotal;
    upcomingTodosTotalRef.current = upcomingTodosTotal;
  }, [
    todayTodos, 
    upcomingTodos, 
    todayTodosPage, 
    upcomingTodosPage, 
    todayTodosLoading, 
    upcomingTodosLoading,
    todayTodosTotal,
    upcomingTodosTotal
  ]);

  // Stats
  const [stats, setStats] = useState({
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  });

  /**
   * Fetch today's todos with pagination and filters
   */
  const fetchTodayTodos = useCallback(async (page = todayTodosPage, reset = false) => {
    // Prevent fetching if already loading
    if (todayTodosLoadingRef.current) return;
    
    // Prevent fetching the same page unless it's a reset
    if (page === todayTodosPageRef.current && !reset && todayTodosRef.current.length > 0) return;
    
    try {
      setTodayTodosLoading(true);
      todayTodosLoadingRef.current = true;
      
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      // Create params object with only the necessary fields
      const params: Partial<TodoFetchParams> = {
        limit: ITEMS_PER_PAGE,
        page,
        sort: 'priority',
        dateFilter: todayStr,
      };
      
      // Only add search if it's not empty and is a valid string
      if (todayTodosSearch && typeof todayTodosSearch === 'string' && todayTodosSearch.trim() !== '') {
        params.search = todayTodosSearch.trim();
      }
      
      // Only add priority if it's not empty
      if (todayTodosPriority && todayTodosPriority !== 'all') {
        params.priority = todayTodosPriority;
      }
      
      // Only add status if it's not empty
      if (todayTodosStatus && todayTodosStatus !== 'all') {
        params.status = todayTodosStatus;
      }
      
      const response = await todoApi.getTodos(params);
      
      if (reset) {
        setTodayTodos(response.todos);
      } else {
        setTodayTodos((prev) => [...prev, ...response.todos]);
      }
      
      setTodayTodosTotal(response.totalItems);
      setTodayTodosHasMore(response.todos.length === ITEMS_PER_PAGE);
      setTodayTodosPage(page);
      
      // Update refs
      todayTodosRef.current = reset ? response.todos : [...todayTodosRef.current, ...response.todos];
      todayTodosPageRef.current = page;
      todayTodosTotalRef.current = response.totalItems;
    } catch (error) {
      console.error('Error fetching today todos:', error);
      setTodayTodosError(error instanceof Error ? error.message : 'Failed to fetch today\'s todos');
    } finally {
      setTodayTodosLoading(false);
      todayTodosLoadingRef.current = false;
    }
  }, [
    todayTodosPage,
    todayTodosSearch,
    todayTodosPriority,
    todayTodosStatus,
  ]);

  /**
   * Load more today's todos
   */
  const loadMoreTodayTodos = useCallback(async () => {
    // Don't load more if already loading, no more items, or reached total
    if (
      todayTodosLoadingRef.current || 
      !todayTodosHasMore || 
      todayTodosRef.current.length >= todayTodosTotalRef.current
    ) {
      return;
    }
    
    await fetchTodayTodos(todayTodosPageRef.current + 1);
  }, [fetchTodayTodos, todayTodosHasMore]);

  /**
   * Handle search query change for today's todos
   */
  const handleTodayTodosSearchChange = useCallback((query: string) => {
    if (query === todayTodosSearch) return;
    
    setTodayTodosSearch(query);
    // Reset pagination when search changes
    setTodayTodosPage(1);
    // Fetch with new search query
    fetchTodayTodos(1, true);
  }, [fetchTodayTodos, todayTodosSearch]);

  /**
   * Handle priority filter change for today's todos
   */
  const handleTodayTodosPriorityChange = useCallback((priority: string) => {
    if (priority === todayTodosPriority) return;
    
    setTodayTodosPriority(priority);
    // Reset pagination when filter changes
    setTodayTodosPage(1);
    // Fetch with new filter
    fetchTodayTodos(1, true);
  }, [fetchTodayTodos, todayTodosPriority]);

  /**
   * Handle status filter change for today's todos
   */
  const handleTodayTodosStatusChange = useCallback((status: string) => {
    if (status === todayTodosStatus) return;
    
    setTodayTodosStatus(status);
    // Reset pagination when filter changes
    setTodayTodosPage(1);
    // Fetch with new filter
    fetchTodayTodos(1, true);
  }, [fetchTodayTodos, todayTodosStatus]);

  /**
   * Fetch upcoming todos with pagination and filters
   */
  const fetchUpcomingTodos = useCallback(async (page = upcomingTodosPage, reset = false) => {
    // Prevent fetching if already loading
    if (upcomingTodosLoadingRef.current) return;
    
    // Prevent fetching the same page unless it's a reset
    if (page === upcomingTodosPageRef.current && !reset && upcomingTodosRef.current.length > 0) return;
    
    try {
      setUpcomingTodosLoading(true);
      upcomingTodosLoadingRef.current = true;
      
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Get date 7 days from tomorrow
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 6);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      // Create params object with only the necessary fields
      const params: Partial<TodoFetchParams> = {
        limit: ITEMS_PER_PAGE,
        page,
        sort: 'dueDate',
        dateRangeStart: tomorrowStr,
        dateRangeEnd: nextWeekStr,
      };
      
      // Only add search if it's not empty and is a valid string
      if (upcomingTodosSearch && typeof upcomingTodosSearch === 'string' && upcomingTodosSearch.trim() !== '') {
        params.search = upcomingTodosSearch.trim();
      }
      
      // Only add priority if it's not empty
      if (upcomingTodosPriority && upcomingTodosPriority !== 'all') {
        params.priority = upcomingTodosPriority;
      }
      
      // Only add status if it's not empty
      if (upcomingTodosStatus && upcomingTodosStatus !== 'all') {
        params.status = upcomingTodosStatus;
      }
      
      const response = await todoApi.getTodos(params);
      
      if (reset) {
        setUpcomingTodos(response.todos);
      } else {
        setUpcomingTodos((prev) => [...prev, ...response.todos]);
      }
      
      setUpcomingTodosTotal(response.totalItems);
      setUpcomingTodosHasMore(response.todos.length === ITEMS_PER_PAGE);
      setUpcomingTodosPage(page);
      
      // Update refs
      upcomingTodosRef.current = reset ? response.todos : [...upcomingTodosRef.current, ...response.todos];
      upcomingTodosPageRef.current = page;
      upcomingTodosTotalRef.current = response.totalItems;
    } catch (error) {
      console.error('Error fetching upcoming todos:', error);
      setUpcomingTodosError(error instanceof Error ? error.message : 'Failed to fetch upcoming todos');
    } finally {
      setUpcomingTodosLoading(false);
      upcomingTodosLoadingRef.current = false;
    }
  }, [
    upcomingTodosPage,
    upcomingTodosSearch,
    upcomingTodosPriority,
    upcomingTodosStatus,
  ]);

  /**
   * Load more upcoming todos
   */
  const loadMoreUpcomingTodos = useCallback(async () => {
    // Don't load more if already loading, no more items, or reached total
    if (
      upcomingTodosLoadingRef.current || 
      !upcomingTodosHasMore || 
      upcomingTodosRef.current.length >= upcomingTodosTotalRef.current
    ) {
      return;
    }
    
    await fetchUpcomingTodos(upcomingTodosPageRef.current + 1);
  }, [fetchUpcomingTodos, upcomingTodosHasMore]);

  /**
   * Handle search query change for upcoming todos
   */
  const handleUpcomingTodosSearchChange = useCallback((query: string) => {
    if (query === upcomingTodosSearch) return;
    
    setUpcomingTodosSearch(query);
    // Reset pagination when search changes
    setUpcomingTodosPage(1);
    // Fetch with new search query
    fetchUpcomingTodos(1, true);
  }, [fetchUpcomingTodos, upcomingTodosSearch]);

  /**
   * Handle priority filter change for upcoming todos
   */
  const handleUpcomingTodosPriorityChange = useCallback((priority: string) => {
    if (priority === upcomingTodosPriority) return;
    
    setUpcomingTodosPriority(priority);
    // Reset pagination when filter changes
    setUpcomingTodosPage(1);
    // Fetch with new filter
    fetchUpcomingTodos(1, true);
  }, [fetchUpcomingTodos, upcomingTodosPriority]);

  /**
   * Handle status filter change for upcoming todos
   */
  const handleUpcomingTodosStatusChange = useCallback((status: string) => {
    if (status === upcomingTodosStatus) return;
    
    setUpcomingTodosStatus(status);
    // Reset pagination when filter changes
    setUpcomingTodosPage(1);
    // Fetch with new filter
    fetchUpcomingTodos(1, true);
  }, [fetchUpcomingTodos, upcomingTodosStatus]);

  /**
   * Fetch dashboard stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const dashboardStats = await todoApi.getDashboardStats();
      
      setStats({
        completedTasks: dashboardStats.completedTodos,
        pendingTasks: dashboardStats.activeTodos,
        overdueTasks: dashboardStats.highPriorityTodos, // Using high priority as a proxy for overdue
        completionRate: dashboardStats.completionRate,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }, []);

  // Create a ref to track initial load outside of the callback
  const isInitialLoadRef = useRef(true);

  /**
   * Function to refresh all dashboard data
   */
  const refreshData = useCallback(async () => {
    if (isInitialLoadRef.current) {
      // Reset pagination and fetch fresh data
      setTodayTodosPage(1);
      setUpcomingTodosPage(1);
      
      // Fetch data with reset flag
      await Promise.all([
        fetchTodayTodos(1, true),
        fetchUpcomingTodos(1, true),
        fetchStats(),
      ]);
      
      // Mark initial load as complete
      isInitialLoadRef.current = false;
    }
  }, [fetchTodayTodos, fetchUpcomingTodos, fetchStats]);

  // Initial data fetch - only run once
  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    todayTodos: {
      items: todayTodos,
      isLoading: todayTodosLoading,
      error: todayTodosError,
      totalItems: todayTodosTotal,
      hasMore: todayTodosHasMore,
      loadMore: loadMoreTodayTodos,
      searchQuery: todayTodosSearch,
      setSearchQuery: handleTodayTodosSearchChange,
      priorityFilter: todayTodosPriority,
      setPriorityFilter: handleTodayTodosPriorityChange,
      statusFilter: todayTodosStatus,
      setStatusFilter: handleTodayTodosStatusChange,
    },
    upcomingTodos: {
      items: upcomingTodos,
      isLoading: upcomingTodosLoading,
      error: upcomingTodosError,
      totalItems: upcomingTodosTotal,
      hasMore: upcomingTodosHasMore,
      loadMore: loadMoreUpcomingTodos,
      searchQuery: upcomingTodosSearch,
      setSearchQuery: handleUpcomingTodosSearchChange,
      priorityFilter: upcomingTodosPriority,
      setPriorityFilter: handleUpcomingTodosPriorityChange,
      statusFilter: upcomingTodosStatus,
      setStatusFilter: handleUpcomingTodosStatusChange,
    },
    stats,
    isLoading: todayTodosLoading || upcomingTodosLoading,
    refreshData,
  };
} 