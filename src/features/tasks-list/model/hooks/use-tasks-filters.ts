import { useCallback, useEffect, useRef, useMemo } from 'react';
import { Task, SortType, FilterType, PriorityFilter, TaskFetchParams } from '../types';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

export function useTasksFilters({
  onFilter,
  onSort,
  clientSideFiltering = false,
}: {
  onFilter?: (params: TaskFetchParams) => void;
  onSort?: (sortBy: SortType) => void;
  clientSideFiltering?: boolean;
}) {
  // Track if we're in the initial mount phase
  const isInitialMount = useRef(true);
  
  // Initialize query parameters with nuqs
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  
  // Define valid values for our enum types
  const sortValues = ['newest', 'oldest', 'priority', 'estimatedTime'] as const;
  const statusValues = ['all', 'active', 'completed'] as const;
  const priorityValues = ['all', 'low', 'medium', 'high'] as const;
  
  // Create parsers with string literals
  const [sortBy, setSortBy] = useQueryState('sort', 
    parseAsStringLiteral(sortValues).withDefault('priority' as SortType)
  );
  
  const [statusFilter, setStatusFilter] = useQueryState('status', 
    parseAsStringLiteral(statusValues).withDefault('active' as FilterType)
  );
  
  const [priorityFilter, setPriorityFilter] = useQueryState('priority', 
    parseAsStringLiteral(priorityValues).withDefault('all' as PriorityFilter)
  );

  // On initial mount, apply the URL parameters to the backend
  useEffect(() => {
    // Only run on initial mount
    if (isInitialMount.current) {
      // Check if we have URL parameters that differ from defaults
      const hasUrlParameters = 
        search !== '' || 
        sortBy !== 'priority' || 
        statusFilter !== 'active' || 
        priorityFilter !== 'all';

      // If we have filters in URL, use them; otherwise send default parameters
      if (onFilter) {
        console.log('[useTasksFilters] Initial load with', 
          hasUrlParameters ? 'URL parameters detected' : 'no URL parameters', 
          {
            search,
            sortBy,
            statusFilter,
            priorityFilter
          }
        );

        // Construct filter parameters object with only necessary fields
        const filterParams: TaskFetchParams = {
          // Always include sortBy and status as they have default values
          sortBy,
          status: statusFilter,
          offset: 0
        };
        
        // Only include other parameters if they have non-default values
        if (search) filterParams.search = search;
        if (priorityFilter !== 'all') filterParams.priority = priorityFilter;
        
        // Trigger filter with appropriate parameters
        onFilter(filterParams);
      }
      
      isInitialMount.current = false;
    }
  }, [search, sortBy, statusFilter, priorityFilter, onFilter]);

  // Handle search changes
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value, { history: 'push' });
    if (onFilter && !isInitialMount.current) {
      const filterParams: TaskFetchParams = {
        sortBy,
        status: statusFilter,
        offset: 0
      };
      
      if (value) filterParams.search = value;
      if (priorityFilter !== 'all') filterParams.priority = priorityFilter;
      
      onFilter(filterParams);
    }
  }, [onFilter, statusFilter, priorityFilter, sortBy, setSearch]);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    // Use empty string instead of undefined to ensure value is properly reset
    setSearch('', { history: 'push' });
    
    if (onFilter && !isInitialMount.current) {
      const filterParams: TaskFetchParams = {
        sortBy,
        status: statusFilter,
        offset: 0
      };
      
      // Don't include search parameter at all when cleared
      if (priorityFilter !== 'all') filterParams.priority = priorityFilter;
      
      // temporary solution
      onFilter({...filterParams,search:''});
    }
  }, [onFilter, statusFilter, priorityFilter, sortBy, setSearch]);

  // Handle sort changes
  const handleSortChange = useCallback((value: SortType) => {
    setSortBy(value, { history: 'push' });
    
    if (!isInitialMount.current) {
      if (onSort) {
        onSort(value);
      }
      
      if (onFilter) {
        const filterParams: TaskFetchParams = {
          sortBy: value,
          status: statusFilter,
          offset: 0
        };
        
        if (search) filterParams.search = search;
        if (priorityFilter !== 'all') filterParams.priority = priorityFilter;
        
        onFilter(filterParams);
      }
    }
  }, [onFilter, onSort, search, statusFilter, priorityFilter, setSortBy]);

  // Handle status filter changes
  const handleStatusFilterChange = useCallback((value: FilterType) => {
    setStatusFilter(value, { history: 'push' });
    if (onFilter && !isInitialMount.current) {
      const filterParams: TaskFetchParams = {
        sortBy,
        status: value,
        offset: 0
      };
      
      if (search) filterParams.search = search;
      if (priorityFilter !== 'all') filterParams.priority = priorityFilter;
      
      onFilter(filterParams);
    }
  }, [onFilter, search, priorityFilter, sortBy, setStatusFilter]);

  // Handle priority filter changes
  const handlePriorityFilterChange = useCallback((value: PriorityFilter) => {
    setPriorityFilter(value, { history: 'push' });
    if (onFilter && !isInitialMount.current) {
      const filterParams: TaskFetchParams = {
        sortBy,
        status: statusFilter,
        offset: 0
      };
      
      if (search) filterParams.search = search;
      if (value !== 'all') filterParams.priority = value;
      
      onFilter(filterParams);
    }
  }, [onFilter, search, statusFilter, sortBy, setPriorityFilter]);

  // Handle clear all filters
  const handleClearFilters = useCallback(() => {
    setSearch('', { history: 'push' });
    setStatusFilter('active', { history: 'push' });
    setPriorityFilter('all', { history: 'push' });
    setSortBy('priority', { history: 'push' });
    
    if (!isInitialMount.current) {
      if (onFilter) {
        const filterParams: TaskFetchParams = {
          sortBy: 'priority',
          status: 'active',
          offset: 0
        };
        
        onFilter(filterParams);
      }
      
      if (onSort) {
        onSort('priority');
      }
    }
  }, [onFilter, onSort, setSearch, setStatusFilter, setPriorityFilter, setSortBy]);

  // Client-side filter function
  const filterTasks = useMemo(() => {
    if (!clientSideFiltering) {
      return (tasks: Task[]) => tasks;
    }

    return (tasks: Task[]) => {
      let filtered = [...tasks];

      // Apply search filter
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(searchLower) || 
          (task.description && task.description.toLowerCase().includes(searchLower))
        );
      }

      // Apply status filter - always filter by status
      if (statusFilter === 'active') {
        filtered = filtered.filter(task => !task.completed);
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter(task => task.completed);
      }

      // Apply priority filter
      if (priorityFilter !== 'all') {
        filtered = filtered.filter(task => task.priority === priorityFilter);
      }

      return filtered;
    };
  }, [clientSideFiltering, search, statusFilter, priorityFilter]);

  return {
    search,
    sortBy,
    statusFilter,
    priorityFilter,
    handleSearchChange,
    handleSearchClear,
    handleSortChange,
    handleStatusFilterChange,
    handlePriorityFilterChange,
    handleClearFilters,
    filterTasks,
  };
} 