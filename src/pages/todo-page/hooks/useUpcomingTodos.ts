'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { TodoItem } from '../../../widgets/todo-list/types';
import { todoApi } from '../../../shared/api/todo-api';

interface UseUpcomingTodosReturn {
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  fetchTodos: () => Promise<void>;
}

/**
 * Custom hook to fetch upcoming todos
 */
export function useUpcomingTodos(): UseUpcomingTodosReturn {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const initialLoadRef = useRef(false);
  
  const fetchTodos = useCallback(async (force = false) => {
    if (isLoading || (initialLoadRef.current && !force)) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await todoApi.getUpcomingTodos();
      setTodos(result.todos);
      setTotalItems(result.totalItems);
      initialLoadRef.current = true;
    } catch (err) {
      setError('Failed to fetch upcoming todos');
      console.error('Failed to fetch upcoming todos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Initial fetch only once
  useEffect(() => {
    if (!initialLoadRef.current) {
      fetchTodos();
    }
  }, [fetchTodos]);

  return {
    todos,
    isLoading,
    error,
    totalItems,
    fetchTodos: () => fetchTodos(true) // Force refresh when called explicitly
  };
} 