import { useState, useCallback, useMemo } from 'react';
import { SortType, FilterType, PriorityFilter, TaskFetchParams, Task } from '../types';

export interface UseTasksFiltersOptions {
  onFilter?: (params: TaskFetchParams) => void;
  onSort?: (sortBy: SortType) => void;
  clientSideFiltering?: boolean;
  initialSort?: SortType;
  initialStatusFilter?: FilterType;
  initialPriorityFilter?: PriorityFilter;
  initialSearch?: string;
  initialView?: 'all' | 'today' | 'upcoming' | 'completed';
}

export interface UseTasksFiltersReturn {
  search: string;
  sortBy: SortType;
  statusFilter: FilterType;
  priorityFilter: PriorityFilter;
  currentView: 'all' | 'today' | 'upcoming' | 'completed';
  taskStats: {
    all: number;
    active: number;
    completed: number;
    today: number;
    upcoming: number;
    high: number;
  };
  handleSearchChange: (value: string) => void;
  handleSearchClear: () => void;
  handleSortChange: (value: SortType) => void;
  handleStatusFilterChange: (value: FilterType) => void;
  handlePriorityFilterChange: (value: PriorityFilter) => void;
  handleClearFilters: () => void;
  filterTasks: (tasks: Task[]) => Task[];
  setView: (view: 'all' | 'today' | 'upcoming' | 'completed') => void;
}

export function useTasksFilters({
  onFilter,
  onSort,
  clientSideFiltering = !onFilter,
  initialSort = 'newest',
  initialStatusFilter = 'all',
  initialPriorityFilter = 'all',
  initialSearch = '',
  initialView = 'all',
}: UseTasksFiltersOptions = {}): UseTasksFiltersReturn {
  // State for search, sort, and filters
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<SortType>(initialSort);
  const [statusFilter, setStatusFilter] = useState<FilterType>(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(initialPriorityFilter);
  const [currentView, setCurrentView] = useState<'all' | 'today' | 'upcoming' | 'completed'>(initialView);

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (onFilter) {
      onFilter({
        search: value,
        status: statusFilter,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        sortBy: sortBy,
      });
    }
  }, [onFilter, statusFilter, priorityFilter, sortBy]);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearch('');
    if (onFilter) {
      onFilter({
        search: '',
        status: statusFilter,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        sortBy: sortBy,
      });
    }
  }, [onFilter, statusFilter, priorityFilter, sortBy]);

  // Handle sort change
  const handleSortChange = useCallback((value: SortType) => {
    setSortBy(value);
    if (onSort) {
      onSort(value);
    }
    if (onFilter) {
      onFilter({
        search,
        status: statusFilter,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        sortBy: value,
      });
    }
  }, [onSort, onFilter, search, statusFilter, priorityFilter]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value: FilterType) => {
    setStatusFilter(value);
    if (onFilter) {
      onFilter({
        search,
        status: value,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        sortBy: sortBy,
      });
    }
  }, [onFilter, search, priorityFilter, sortBy]);

  // Handle priority filter change
  const handlePriorityFilterChange = useCallback((value: PriorityFilter) => {
    setPriorityFilter(value);
    if (onFilter) {
      onFilter({
        search,
        status: statusFilter,
        priority: value !== 'all' ? value : undefined,
        sortBy: sortBy,
      });
    }
  }, [onFilter, search, statusFilter, sortBy]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    // Reset all filter states
    setStatusFilter('all');
    setPriorityFilter('all');
    
    if (onFilter) {
      onFilter({
        search, // Keep the search term as is
        status: undefined, // Clear status filter
        priority: undefined, // Clear priority filter
        sortBy, // Keep the current sort
        offset: 0, // Reset pagination
      });
    }
  }, [onFilter, search, sortBy]);

  // Client-side filtering and sorting function
  const filterTasks = useCallback((tasks: Task[]): Task[] => {
    if (!clientSideFiltering) return tasks;

    let filtered = [...tasks];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        task => 
          task.title.toLowerCase().includes(searchLower) || 
          (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => 
        statusFilter === 'completed' ? task.completed : !task.completed
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'estimatedTime') {
        const getTimeInMinutes = (time: string | undefined) => {
          if (!time) return 0;
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        return getTimeInMinutes(a.estimatedTime) - getTimeInMinutes(b.estimatedTime);
      }
      return 0;
    });

    return filtered;
  }, [search, statusFilter, priorityFilter, sortBy, clientSideFiltering]);

  // Set view handler
  const setView = useCallback((view: 'all' | 'today' | 'upcoming' | 'completed') => {
    setCurrentView(view);
    
    // Update status filter based on view
    if (view === 'completed') {
      setStatusFilter('completed');
    } else if (view === 'all') {
      setStatusFilter('all');
    } else {
      setStatusFilter('active');
    }
    
    // If we have an external filter handler, call it
    if (onFilter) {
      onFilter({
        search,
        status: view === 'completed' ? 'completed' : view === 'all' ? undefined : 'active',
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        sortBy: sortBy,
        dateFilter: view === 'today' ? 'today' : view === 'upcoming' ? 'upcoming' : undefined,
      });
    }
  }, [onFilter, search, priorityFilter, sortBy]);

  // Calculate task statistics
  const calculateTaskStats = useCallback((tasks: Task[]) => {
    const all = tasks.length;
    const active = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    
    // For today and upcoming, we would ideally use date filtering
    // This is a simplified version that would be replaced with proper date logic
    const today = Math.floor(active * 0.4); // Simplified calculation
    const upcoming = Math.floor(active * 0.6); // Simplified calculation
    const high = tasks.filter(task => task.priority === 'high').length;
    
    return { all, active, completed, today, upcoming, high };
  }, []);

  // Memoize task stats
  const taskStats = useMemo(() => {
    return calculateTaskStats(clientSideFiltering ? [] : []);
  }, [calculateTaskStats, clientSideFiltering]);

  return {
    search,
    sortBy,
    statusFilter,
    priorityFilter,
    currentView,
    taskStats,
    handleSearchChange,
    handleSearchClear,
    handleSortChange,
    handleStatusFilterChange,
    handlePriorityFilterChange,
    handleClearFilters,
    filterTasks,
    setView,
  };
} 