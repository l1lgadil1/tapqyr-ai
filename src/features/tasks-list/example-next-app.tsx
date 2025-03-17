'use client';

import { useCallback, useRef, useEffect } from 'react';
import { 
  TasksList, 
  TasksListLayout, 
  TasksSearch, 
  TasksSort, 
  TasksFilter,
  useTasks,
  useTasksFilters
} from '.';

/**
 * Example of using TasksList component in a Next.js app with custom hooks
 */
export function TasksListNextExample() {
  // Track if this is the initial render
  const isInitialMount = useRef(true);
  
  // Use the useTasksFilters hook to manage all filter state
  const { 
    search: searchQuery,
    sortBy: sortType,
    statusFilter: activeFilter,
    priorityFilter,
    currentView,
    taskStats,
    handleSearchChange: setSearchQuery,
    handleSearchClear,
    handleSortChange: setSortType,
    handleStatusFilterChange: setActiveFilter,
    handlePriorityFilterChange: setPriorityFilter,
    handleClearFilters,
    setView
  } = useTasksFilters({
    initialSort: 'newest',
    initialStatusFilter: 'all',
    initialPriorityFilter: 'all',
    initialSearch: '',
    initialView: 'all'
  });

  // Use the useTasks hook with the filter state from useTasksFilters
  const { 
    tasks, 
    isLoading, 
    error, 
    refreshTasks, 
    toggleTaskCompletion, 
    deleteTask,
    loadMore,
    hasMore,
    totalItems
  } = useTasks({
    initialParams: {
      search: searchQuery,
      status: activeFilter === 'all' ? undefined : activeFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
      sort: sortType,
      offset: 0,
      limit: 10
    },
    autoFetch: true,
    skipInitialFetch: false
  });

  // Handle view change with proper state updates
  const handleViewChange = useCallback((view: 'all' | 'today' | 'upcoming' | 'completed') => {
    setView(view);
  }, [setView]);

  // Handle load more with proper error handling
  const handleLoadMore = useCallback(() => {
    console.log('handleLoadMore called');
    // Call loadMore and handle the promise
    return loadMore()
      .then(() => {
        console.log('LoadMore completed successfully');
      })
      .catch(error => {
        console.error('Error in loadMore:', error);
      });
  }, [loadMore]);

  // Use effect to refresh tasks when filters change, but not on initial render
  useEffect(() => {
    // Skip the effect on the initial render since useTasks will fetch initially
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    console.log('Filters changed, refreshing tasks with:', {
      searchQuery,
      activeFilter,
      priorityFilter,
      sortType
    });

    // Create a debounce timeout to prevent too many requests
    const timeoutId = setTimeout(() => {
      refreshTasks();
    }, 300); // 300ms debounce
    
    // Clean up the timeout
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilter, priorityFilter, sortType, refreshTasks]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Task Management</h1>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div 
          className={`p-4 rounded-lg shadow ${currentView === 'all' ? 'bg-blue-100' : 'bg-gray-100'} cursor-pointer`}
          onClick={() => handleViewChange('all')}
        >
          <h3 className="font-medium">All Tasks</h3>
          <p className="text-2xl font-bold">{taskStats.all}</p>
        </div>
        <div 
          className={`p-4 rounded-lg shadow ${currentView === 'today' ? 'bg-green-100' : 'bg-gray-100'} cursor-pointer`}
          onClick={() => handleViewChange('today')}
        >
          <h3 className="font-medium">Today</h3>
          <p className="text-2xl font-bold">{taskStats.today}</p>
        </div>
        <div 
          className={`p-4 rounded-lg shadow ${currentView === 'upcoming' ? 'bg-purple-100' : 'bg-gray-100'} cursor-pointer`}
          onClick={() => handleViewChange('upcoming')}
        >
          <h3 className="font-medium">Upcoming</h3>
          <p className="text-2xl font-bold">{taskStats.upcoming}</p>
        </div>
        <div 
          className={`p-4 rounded-lg shadow ${currentView === 'completed' ? 'bg-green-100' : 'bg-gray-100'} cursor-pointer`}
          onClick={() => handleViewChange('completed')}
        >
          <h3 className="font-medium">Completed</h3>
          <p className="text-2xl font-bold">{taskStats.completed}</p>
        </div>
      </div>

      <TasksListLayout
        header={
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <TasksSearch 
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={handleSearchClear}
              className="flex-1"
            />
            <div className="flex gap-4">
              <TasksFilter 
                statusFilter={activeFilter}
                priorityFilter={priorityFilter}
                onStatusFilterChange={setActiveFilter}
                onPriorityFilterChange={setPriorityFilter}
                onClearFilters={handleClearFilters}
                className="flex-1"
              />
              <TasksSort 
                value={sortType}
                onChange={setSortType}
                className="flex-1"
              />
            </div>
          </div>
        }
        content={
          <TasksList
            tasks={tasks}
            onToggleComplete={toggleTaskCompletion}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            totalItems={totalItems}
            onDelete={deleteTask}
            onEdit={() => {}}
            isLoading={isLoading}
            error={error}
          />
        }
      />
    </div>
  );
} 