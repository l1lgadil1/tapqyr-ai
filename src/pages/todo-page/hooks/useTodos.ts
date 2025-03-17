'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  FilterPriority, 
  FilterStatus, 
  SortOption 
} from '../types';
import { TodoItem } from '../../../widgets/todo-list/types';
import { useDebounce } from './useDebounce';
import { todoApi } from '../../../shared/api/todo-api';

interface UseTodosProps {
  initialPage?: number;
  pageSize?: number;
  initialSortBy?: SortOption;
}

interface UseTodosReturn {
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  hasMore: boolean;
  currentPage: number;
  searchQuery: string;
  filterPriority: FilterPriority;
  filterStatus: FilterStatus;
  sortBy: SortOption;
  autoFilter: boolean;
  fetchTodos: () => Promise<void>;
  fetchMoreTodos: () => Promise<void>;
  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => Promise<void>;
  updateTodo: (updatedTodo: TodoItem) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  generateTodos: (prompt: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: FilterPriority) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setSortBy: (sort: SortOption) => void;
  setAutoFilter: (filter: boolean) => void;
}

/**
 * Custom hook to manage todos with filtering, sorting, and pagination
 */
export function useTodos({
  initialPage = 1,
  pageSize = 10,
  initialSortBy = 'newest'
}: UseTodosProps = {}): UseTodosReturn {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy);
  const [autoFilter, setAutoFilter] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const skipNextFetchRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  
  // Minimum time between fetches in milliseconds
  const FETCH_THROTTLE = 500;
  
  // Add debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Memoize filter state to prevent unnecessary re-renders
  const filterState = useCallback(() => ({
    sortBy,
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
    search: debouncedSearchQuery,
    priority: filterPriority === 'all' ? undefined : filterPriority,
    status: filterStatus === 'all' ? undefined : filterStatus,
    isAIGenerated: autoFilter ? true : undefined
  }), [
    sortBy,
    currentPage,
    pageSize,
    debouncedSearchQuery,
    filterPriority,
    filterStatus,
    autoFilter
  ]);
  
  // Store current filter state in a ref to avoid dependency cycles
  const filterStateRef = useRef(filterState());
  
  // Update ref when filter state changes
  useEffect(() => {
    filterStateRef.current = filterState();
  }, [filterState]);

  const fetchTodos = useCallback(async (shouldResetTodos = false) => {
    // Skip if already loading or if skipNextFetchRef is true
    if (isLoading || skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    
    // Throttle requests to prevent too many API calls
    const now = Date.now();
    if (now - lastFetchTimeRef.current < FETCH_THROTTLE) {
      return;
    }
    lastFetchTimeRef.current = now;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const params = filterStateRef.current;
      const result = await todoApi.getTodos(params);
      
      setTodos(prevTodos => shouldResetTodos ? result.todos : [...prevTodos, ...result.todos]);
      setTotalItems(result.totalItems);
      setHasMore(result.todos.length === pageSize);
      
      if (shouldResetTodos) {
        setCurrentPage(1);
      } else {
        setCurrentPage(prev => prev + 1);
      }
    } catch (err) {
      setError('Failed to fetch todos');
      console.error('Failed to fetch todos:', err);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [pageSize, isLoading, FETCH_THROTTLE]);

  // Initial fetch and filter change handler
  const handleFilterChange = useCallback(async () => {
    if (isLoading) return;
    await fetchTodos(true);
  }, [fetchTodos, isLoading]);

  const fetchMoreTodos = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchTodos(false);
  }, [hasMore, isLoading, fetchTodos]);

  // Reset page and fetch todos when filters change
  useEffect(() => {
    // Skip the first render and when skipNextFetchRef is true
    if (isInitialLoad || skipNextFetchRef.current) {
      return;
    }
    
    // Use a timeout to debounce filter changes
    const timeoutId = setTimeout(() => {
      handleFilterChange();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [debouncedSearchQuery, filterPriority, filterStatus, sortBy, autoFilter, handleFilterChange, isInitialLoad]);

  const addTodo = async (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    try {
      setIsLoading(true);
      const newTodo = await todoApi.createTodo(todo);
      
      // Skip the next automatic fetch that would be triggered by state changes
      skipNextFetchRef.current = true;
      
      // Update the todos array directly
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setTotalItems(prev => prev + 1);
    } catch (err) {
      console.error('Failed to add todo:', err);
      setError('Failed to add todo. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTodo = async (updatedTodo: TodoItem) => {
    try {
      setIsLoading(true);
      const { id, title, description, completed, dueDate, priority } = updatedTodo;
      const result = await todoApi.updateTodo(id, { 
        title, 
        description, 
        completed, 
        dueDate, 
        priority 
      });
      
      // Skip the next automatic fetch that would be triggered by state changes
      skipNextFetchRef.current = true;
      
      // Update the todos array directly
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? result : todo)
      );
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError('Failed to update todo. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setIsLoading(true);
      await todoApi.deleteTodo(id);
      
      // Skip the next automatic fetch that would be triggered by state changes
      skipNextFetchRef.current = true;
      
      // Update the todos array directly
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      setTotalItems(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('Failed to delete todo. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todoToToggle = todos.find(todo => todo.id === id);
      if (!todoToToggle) return;
      
      setIsLoading(true);
      const updatedTodo = await todoApi.updateTodo(id, { 
        ...todoToToggle, 
        completed: !todoToToggle.completed 
      });
      
      // Skip the next automatic fetch that would be triggered by state changes
      skipNextFetchRef.current = true;
      
      // Update the todos array directly
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? updatedTodo : todo)
      );
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      setError('Failed to toggle todo status. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateTodos = async (prompt: string) => {
    try {
      setIsLoading(true);
      const newTodos = await todoApi.generateTodos(prompt);
      
      // Skip the next automatic fetch that would be triggered by state changes
      skipNextFetchRef.current = true;
      
      // Update the todos array directly
      setTodos(prevTodos => [...prevTodos, ...newTodos]);
      setTotalItems(prev => prev + newTodos.length);
    } catch (err) {
      console.error('Failed to generate todos:', err);
      setError('Failed to generate tasks. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialTodos = async () => {
      try {
        setIsLoading(true);
        const initialTodos = await todoApi.getTodos({ page: 1, limit: 10 });
        
        // Skip the next automatic fetch that would be triggered by state changes
        skipNextFetchRef.current = true;
        
        // Update the todos array directly
        setTodos(initialTodos.todos);
        setTotalItems(initialTodos.totalItems);
        setHasMore(initialTodos.todos.length === pageSize);
      } catch (err) {
        console.error('Failed to fetch initial todos:', err);
        setError('Failed to load initial tasks. Please try again.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialTodos();
  }, []); // Empty dependency array ensures this runs only once on mount

  return {
    todos: todos || [],
    isLoading,
    error,
    totalItems,
    hasMore,
    currentPage,
    searchQuery,
    filterPriority,
    filterStatus,
    sortBy,
    autoFilter,
    fetchTodos: handleFilterChange,
    fetchMoreTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    generateTodos,
    setSearchQuery,
    setFilterPriority,
    setFilterStatus,
    setSortBy,
    setAutoFilter
  };
} 