import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, TaskFetchParams, SortType, FilterType, PriorityFilter } from '../types';
import { tasksApi } from '../api';

export interface UseTasksOptions {
  initialParams?: TaskFetchParams;
  autoFetch?: boolean;
  view?: 'all' | 'today' | 'upcoming' | 'completed';
  filter?: FilterType;
  priority?: PriorityFilter;
  sort?: SortType;
  search?: string;
  initialTasks?: Task[];
  skipInitialFetch?: boolean;
}

export interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalItems: number;
  updatingTaskIds: Set<string>;
  fetchTasks: (params?: TaskFetchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  editTask: (id: string) => void;
  refreshTasks: () => Promise<void>;
  refetchTasks: () => Promise<void>;
  changeView: (view: 'all' | 'today' | 'upcoming' | 'completed') => Promise<void>;
  stats: {
    totalTodos: number;
    completedTodos: number;
    activeTodos: number;
    todayTodos: number;
    upcomingTodos: number;
    highPriorityTodos: number;
    completionRate: number;
  } | null;
}

export function useTasks({
  initialParams = { offset: 0, limit: 10 },
  autoFetch = true,
  view = 'all',
  filter,
  priority,
  sort,
  search,
  initialTasks = [],
  skipInitialFetch = false,
}: UseTasksOptions = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Merge the filter, priority, sort, and search params with initialParams
  const mergedInitialParams = {
    ...initialParams,
    status: filter,
    priority: priority,
    sort: sort,
    search: search
  };
  const initialFetchRef=  useRef(false)
  const [fetchParams, setFetchParams] = useState<TaskFetchParams>(mergedInitialParams);
  const [currentView, setCurrentView] = useState<'all' | 'today' | 'upcoming' | 'completed'>(view);
  const [stats, setStats] = useState<{
    totalTodos: number;
    completedTodos: number;
    activeTodos: number;
    todayTodos: number;
    upcomingTodos: number;
    highPriorityTodos: number;
    completionRate: number;
  } | null>(null);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const dashboardStats = await tasksApi.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      // Don't set error state here to avoid disrupting the main task list
    }
  }, []);

const resetTasks = useCallback(() => {
  setTasks([]);
  setTotalItems(0);
  setHasMore(false);
}, []);

  // Fetch tasks based on current view
  const fetchTasks = useCallback(async (params: TaskFetchParams = {}) => {
    if(params.offset === 0) resetTasks();
    if(isLoading) return;
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a new merged params object to avoid reference issues
      const mergedParams = { ...fetchParams, ...params };
      
      // If status or priority is explicitly set to undefined, remove them from the params
      if (params.status === undefined && 'status' in params) {
        delete mergedParams.status;
      }
      
      if (params.priority === undefined && 'priority' in params) {
        delete mergedParams.priority;
      }
      
      console.log('Fetching tasks with params:', JSON.stringify(mergedParams, null, 2)); // Debug log
      
      let result: { tasks: Task[]; totalItems: number, hasMore?: boolean };
      
      // Choose the appropriate API method based on the current view
      if (currentView === 'today') {
        result = await tasksApi.getTodayTodos();
      } else if (currentView === 'upcoming') {
        result = await tasksApi.getUpcomingTasks();
      } else {
        result = await tasksApi.getTasks(mergedParams);
      }
      
      const { tasks: fetchedTasks, totalItems: total } = result;
      
      // If it's a new search or filter, replace the tasks
      // Otherwise, append to existing tasks for pagination
      if (params.offset === 0 ) {
        setTasks(fetchedTasks);
      } else {
        // Always append new tasks to existing ones for pagination
        setTasks(prevTasks => {
          // Create a map of existing task IDs to avoid duplicates
          const existingTaskIds = new Set(prevTasks.map(task => task.id));
          // Filter out any duplicates from the fetched tasks
          const uniqueNewTasks = fetchedTasks.filter(task => !existingTaskIds.has(task.id));
          // Return the combined array
          return [...prevTasks, ...uniqueNewTasks];
        });
      }
      
      setTotalItems(total);
      
      // Calculate if there are more items to load
      // We need to check if the total number of tasks we'll have after this fetch
      // is less than the total number of tasks available
      setHasMore(() => {
        if (params.offset === 0) {
          // If we're starting from the beginning, check if we've loaded all items
          return fetchedTasks.length < total;
        } else {
          // For pagination, calculate based on current tasks + new tasks
          return (tasks.length + fetchedTasks.filter(task => 
            !tasks.some(existingTask => existingTask.id === task.id)
          ).length) < total;
        }
      });
      
      // Update fetchParams AFTER using it to ensure state consistency
      // This is crucial for pagination to work correctly
      setFetchParams(mergedParams);
      console.log('Updated fetchParams to:', JSON.stringify(mergedParams, null, 2)); // Debug log
      

      initialFetchRef.current = true;
    } catch (err) {
      console.error('Error fetching tasks:', err); // Debug log
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [fetchParams, currentView, fetchStats, isLoading, tasks]);

  // Refresh tasks
  const refreshTasks = useCallback(() => {
    return fetchTasks({ offset: 0 });
  }, [fetchTasks]);

  // Change view (all, today, upcoming)
  const changeView = useCallback(async (newView: 'all' | 'today' | 'upcoming' | 'completed') => {
    setCurrentView(newView);
    // Reset pagination when changing views
    
    // Fetch tasks for the new view
    try {
      setIsLoading(true);
      setError(null);
      
      let result: { tasks: Task[]; totalItems: number; hasMore?: boolean };
      
      if (newView === 'today') {
        result = await tasksApi.getTodayTodos();
      } else if (newView === 'upcoming') {
        result = await tasksApi.getUpcomingTasks();
      } else {
        result = await tasksApi.getTasks({ ...fetchParams, offset: 0 });
      }
      
      const { tasks: fetchedTasks, totalItems: total, hasMore: paginationHasMore } = result;
      
      setTasks(fetchedTasks);
      setTotalItems(total);
      setHasMore(paginationHasMore !== false && fetchedTasks.length < total);
      
      // Fetch stats when view changes
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [fetchParams, fetchStats]);

  // Load more tasks
  const loadMore = useCallback(() => {
    // Prevent multiple rapid calls
    if (loadMoreTimeoutRef.current) {
      clearTimeout(loadMoreTimeoutRef.current);
      loadMoreTimeoutRef.current = null;
    }
    
    // Allow loading more for any view if the API supports pagination for that view
    // Only restrict if we're already loading or there are no more items
    if (isLoading || !hasMore) {
      console.log('LoadMore aborted: isLoading =', isLoading, 'hasMore =', hasMore);
      return Promise.resolve();
    }
    
    // Calculate the next page based on current offset and limit
    const currentOffset = fetchParams.offset || 0;
    const currentLimit = fetchParams.limit || 10;
    const nextOffset = currentOffset + currentLimit;
    
    // Safety check: if we've already loaded all items
    if (tasks.length >= totalItems) {
      console.log('LoadMore aborted: All items already loaded');
      setHasMore(false);
      return Promise.resolve();
    }
    
    console.log('LoadMore: Current offset =', currentOffset, 'Next offset =', nextOffset, 'Total items =', totalItems, 'Current tasks =', tasks.length); // Debug log
    
    // For views other than 'all', we need to check if pagination is supported
    if (currentView !== 'all') {
      // If the view doesn't support pagination, just return a resolved promise
      if (currentView === 'today' || currentView === 'upcoming') {
        console.log(`Pagination not supported for ${currentView} view`);
        return Promise.resolve();
      }
    }
    
    // Use debounce to prevent multiple rapid calls
    return new Promise<void>((resolve) => {
      loadMoreTimeoutRef.current = setTimeout(() => {
        // Preserve all existing query parameters when loading more
        fetchTasks({ 
          ...fetchParams, 
          offset: nextOffset 
        }).then(() => {
          // Check if we've loaded all items after fetching
          if (tasks.length >= totalItems) {
            setHasMore(false);
          }
          resolve();
        }).catch((err) => {
          console.error('Error in loadMore:', err);
          resolve(); // Resolve anyway to prevent hanging promises
        });
      }, 300);
    });
  }, [fetchTasks, currentView, fetchParams, isLoading, hasMore, tasks, totalItems]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (id: string) => {
    try {
      setUpdatingTaskIds(prev => new Set(prev).add(id));
      await tasksApi.toggleTaskCompletion(id);
      
      // Update the task in the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
      
      // Refresh stats after toggling completion
      fetchStats();
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return Promise.reject(err);
    } finally {
      setUpdatingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [fetchStats]);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    try {
      setUpdatingTaskIds(prev => new Set(prev).add(id));
      await tasksApi.deleteTask(id);
      
      // Remove the task from the local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setTotalItems(prev => prev - 1);
      
      // Refresh stats after deleting a task
      fetchStats();
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return Promise.reject(err);
    } finally {
      setUpdatingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [fetchStats]);

  // Edit task (in a real app, this would open a modal or navigate to an edit page)
  const editTask = useCallback((id: string) => {
    console.log(`Edit task with ID: ${id}`);
    // In a real app, you would navigate to an edit page or open a modal
  }, []);

  // Initial fetch if autoFetch is true and skipInitialFetch is false
  useEffect(() => {
    if (autoFetch && !skipInitialFetch && !initialFetchRef.current) {
      fetchTasks();
      fetchStats();
    }
  }, [autoFetch, fetchTasks, skipInitialFetch]);

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    tasks,
    isLoading,
    error,
    hasMore,
    totalItems,
    updatingTaskIds,
    fetchTasks,
    loadMore,
    toggleTaskCompletion,
    completeTask: toggleTaskCompletion,
    deleteTask,
    editTask,
    refreshTasks,
    refetchTasks: refreshTasks,
    changeView,
    stats,
  };
} 