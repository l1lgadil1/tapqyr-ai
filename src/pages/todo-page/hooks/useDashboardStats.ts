'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { todoApi } from '../../../shared/api/todo-api';

interface DashboardStats {
  totalTodos: number;
  completedTodos: number;
  activeTodos: number;
  todayTodos: number;
  upcomingTodos: number;
  highPriorityTodos: number;
  completionRate: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

/**
 * Custom hook to fetch dashboard statistics
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadRef = useRef(false);
  
  const fetchStats = useCallback(async (force = false) => {
    if (isLoading || (initialLoadRef.current && !force)) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await todoApi.getDashboardStats();
      setStats(result);
      initialLoadRef.current = true;
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Failed to fetch dashboard statistics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Initial fetch only once
  useEffect(() => {
    if (!initialLoadRef.current) {
      fetchStats();
    }
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats: () => fetchStats(true) // Force refresh when called explicitly
  };
} 