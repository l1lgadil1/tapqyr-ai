import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { TasksListProps } from '../model/types';
import { TaskItem } from './task-item';
import { TasksListLayout } from './tasks-list-layout';
import { TasksSearch } from './tasks-search';
import { TasksSort } from './tasks-sort';
import { TasksFilter } from './tasks-filter';
import { ScrollArea } from '../../../shared/ui/scroll-area';
import { useTasksFilters } from '../model/hooks/use-tasks-filters';
import { useIntersectionObserver } from '../../../shared/hooks/useIntersectionObserver';

export function TasksList({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onSort,
  onFilter,
  className,
  isLoading = false,
  error = null,
  hasMore = false,
  totalItems = 0,
  onLoadMore,
  updatingTaskIds = new Set(),
}: TasksListProps) {
  // Use the tasks filters hook
  const {
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
  } = useTasksFilters({
    onFilter,
    onSort,
    clientSideFiltering: !onFilter,
  });

  // Apply client-side filtering if needed
  const filteredTasks = filterTasks(tasks);
  
  // Track if we're currently loading more items to prevent duplicate requests
  const isLoadingMore = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up intersection observer for infinite scrolling
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    // Only enable if we have more items to load and we're not currently loading
    enabled: hasMore && !isLoading && !isLoadingMore.current
  });
  
  // Load more tasks when the user scrolls to the bottom
  useEffect(() => {
    // Only trigger if we're intersecting, have more items, not already loading, and have a callback
    if (isIntersecting && hasMore && onLoadMore && !isLoading && !isLoadingMore.current) {
      console.log('Intersection observer triggered loadMore');
      isLoadingMore.current = true;
      
      // Call the loadMore function
      if (onLoadMore) {
        onLoadMore();
      }
      
      // Reset the loading flag after a delay
      timeoutRef.current = setTimeout(() => {
        isLoadingMore.current = false;
      }, 500);
    }
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isIntersecting, hasMore, onLoadMore, isLoading]);
  
  // Render header
  const renderHeader = () => (
    <>
      <TasksSearch
        value={search}
        onChange={handleSearchChange}
        onClear={handleSearchClear}
      />
      <div className="flex flex-wrap items-center gap-2">
        <TasksSort
          value={sortBy}
          onChange={handleSortChange}
        />
        <TasksFilter
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onPriorityFilterChange={handlePriorityFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>
    </>
  );

  console.log(isLoading,isLoadingMore);

  // Render content with tasks list
  const renderContent = () => {
    if (error) {
      return (
        <div className="p-8 text-center">
          <p className="text-destructive mb-2">Error loading tasks</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (isLoading && tasks.length === 0) {
      return (
        <div className="p-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="h-16 bg-secondary/20 rounded-md"></div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredTasks.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-xl font-medium mb-2">No tasks found</p>
          <p className="text-muted-foreground">
            {search ? 'Try adjusting your search or filters' : 'Create a new task to get started'}
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px]">
        <div className="p-2 space-y-2">
          <AnimatePresence initial={false}>
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <TaskItem
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  completed={task.completed}
                  priority={task.priority}
                  estimatedTime={task.estimatedTime}
                  isUpdating={updatingTaskIds.has(task.id)}
                  onToggle={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Intersection observer target element */}
          {hasMore && (
            <div 
              ref={ref} 
              className="h-10 w-full flex items-center justify-center"
            >
              {(isLoading || isLoadingMore.current) && (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary/70" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  // Render footer with task count
  const renderFooter = () => {
    if (filteredTasks.length === 0) return null;
    
    return (
      <div className="text-xs text-muted-foreground text-center">
        Showing {filteredTasks.length} of {totalItems} tasks
      </div>
    );
  };

  return (
    <TasksListLayout
      header={renderHeader()}
      content={renderContent()}
      footer={renderFooter()}
      className={className}
    />
  );
} 