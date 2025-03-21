import { useEffect, useRef, useState } from "react";
import { useTasks, useTasksFilters } from "./model/hooks";
import { useIntersectionObserver } from "../../shared/hooks/useIntersectionObserver";
import { TasksSearch } from "./ui/tasks-search";
import { TasksSort } from "./ui/tasks-sort";
import { TasksFilter } from "./ui/tasks-filter";
import { AnimatePresence, motion } from "framer-motion";
import { TaskItem } from "./ui/task-item";
import { TasksListLayout } from "./ui/tasks-list-layout";
import { Loader2 } from "lucide-react";
// import { tasksApi } from "./model/api";
// import { TaskViewDialog } from "./ui/task-view-dialog";
import { cn } from "../../shared/lib/utils";

export interface TasksListProps {
    className?: string;
}

export function TasksList({ className }: TasksListProps = {}) {
    // Use the tasks filters hook first to get initial URL params
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
        // These handlers are used for client-side filter changes
        onFilter: (params) => {
            fetchTasks(params);
            setFilterChangeCounter((prev) => prev + 1); // Increment counter on filter change
        },
        onSort: (sortBy) => {
            fetchTasks({ sortBy, offset: 0 });
            setFilterChangeCounter((prev) => prev + 1); // Increment counter on sort change
        },
        clientSideFiltering: false,
    });

    // Use the tasks hook to fetch and manage tasks
    const {
        tasks,
        isLoading,
        error,
        hasMore,
        totalItems,
        updatingTaskIds,
        loadMore,
        toggleTaskCompletion,
        deleteTask,
        fetchTasks,
    } = useTasks({
        autoFetch: false, // Disable auto-fetch to prevent duplicate requests
        initialParams: {
            // Only include search if it's not empty
            ...(search ? { search } : {}),
            // Include status filter by default with 'active'
            status: statusFilter,
            // Only include priority if it's not 'all'
            ...(priorityFilter !== 'all' ? { priority: priorityFilter } : {}),
            // Always include sortBy
            sortBy,
            limit: 10,
            offset: 0
        },
    });

    // State for task viewing and editing
    // Commented out since we're not using TaskViewDialog right now
    // const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    // const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Track the last filter state to detect changes
    const [filterChangeCounter, setFilterChangeCounter] = useState(0);

    // Track if we're currently loading more items to prevent duplicate requests
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Ensure we fetch data on initial mount if the filter hook doesn't
    const initialFetchRef = useRef(true);

    // Apply client-side filtering if needed
    const filteredTasks = filterTasks(tasks);

    // Fetch initial data if none was fetched by the filter hook
    useEffect(() => {
        // Check if we have active filters that should have triggered a fetch
        const hasActiveFilters = 
            search !== '' || 
            sortBy !== 'priority' || 
            statusFilter !== 'active' || 
            priorityFilter !== 'all';

        // Only fetch if:
        // 1. We're still on initial load
        // 2. No tasks loaded yet and we're not currently loading
        // 3. We don't have active filters (if we have filters, the filter hook should handle the fetch)
        if (initialFetchRef.current && tasks.length === 0 && !isLoading && !hasActiveFilters) {
            console.log('[TasksList] No filters active, performing initial fetch');
            initialFetchRef.current = false;
            // Fetch with default parameters
            fetchTasks({
                sortBy: 'priority',
                status: 'active',
                offset: 0
            });
        } else if (initialFetchRef.current) {
            // Just mark initial fetch as complete without fetching again
            initialFetchRef.current = false;
        }
    }, [fetchTasks, isLoading, tasks.length, search, sortBy, statusFilter, priorityFilter]);

    // Set up intersection observer for infinite scrolling
    const { ref, isIntersecting } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '100px',
        // Only enable if we have more items to load and we're not currently loading
        enabled: hasMore && !isLoading,
    });

    // Reset loading state when filters change
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, [filterChangeCounter]);

    // Load more todos when the user scrolls to the bottom - with debounce
    useEffect(() => {
        if (!isIntersecting || !hasMore || !loadMore || isLoading) return;

        // Add debounce to prevent multiple calls
        const timer = setTimeout(() => {
            loadMore();
        }, 300);

        return () => clearTimeout(timer);
    }, [isIntersecting, hasMore, loadMore, isLoading]);

    // Handle task item click to view details
    const handleTaskView = (id: string) => {
        const task = tasks.find(task => task.id === id);
        if (task) {
            // setSelectedTask(task);
            // setIsViewModalOpen(true);
            console.log('Task view not implemented:', task);
        }
    };

    // Save edited task - commented out since the dialog is not used
    /* 
    const handleSaveTask = async (taskData: Partial<Task>) => {
        try {
            // If we have an ID, it's an update
            if (taskData.id) {
                await tasksApi.updateTask(taskData.id, taskData);
                
                // Refresh the task list instead of directly updating state
                fetchTasks({ offset: 0 });
            }
            
            return Promise.resolve();
        } catch (error) {
            console.error("Failed to save task:", error);
            return Promise.reject(error);
        }
    };
    */

    // Prepare content section
    const renderContent = () => {
        // Loading State
        if (isLoading && filteredTasks.length === 0) {
            return (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                </div>
            );
        }

        // Error State
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-destructive font-medium">Failed to load tasks</div>
                    <button 
                        className="mt-2 text-sm text-primary hover:underline"
                        onClick={() => fetchTasks()}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        // Empty State
        if (!isLoading && !error && filteredTasks.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="text-muted-foreground mb-2">No tasks found</div>
                    {(search || statusFilter !== 'active' || sortBy !== 'priority' || priorityFilter !== 'all') && (
                        <button 
                            className="text-sm text-primary hover:underline"
                            onClick={handleClearFilters}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            );
        }

        // Task List
        return (
            <div className="space-y-2 mt-2 pb-10">
                <AnimatePresence initial={false}>
                    {filteredTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
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
                                onToggle={() => toggleTaskCompletion(task.id)}
                                onDelete={() => deleteTask(task.id)}
                                onEdit={() => handleTaskView(task.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Load More Indicator */}
                {(hasMore && filteredTasks.length > 0) && (
                    <div 
                        ref={ref}
                        className={cn(
                            "flex items-center justify-center py-4",
                            isLoading ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                    </div>
                )}
            </div>
        );
    };

    // Prepare header
    const renderHeader = () => (
        <>
            <TasksSearch
                value={search || ""}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
            />
            <div className="flex items-center justify-between gap-2 mt-4">
                <TasksFilter
                    statusFilter={statusFilter}
                    priorityFilter={priorityFilter}
                    onStatusFilterChange={handleStatusFilterChange}
                    onPriorityFilterChange={handlePriorityFilterChange}
                    onClearFilters={handleClearFilters}
                />
                <TasksSort 
                    value={sortBy} 
                    onChange={handleSortChange} 
                />
            </div>
        </>
    );

    // Prepare footer with task count
    const renderFooter = () => {
        if (filteredTasks.length === 0) return null;
        
        return (
            <div className="text-xs text-muted-foreground">
                Showing {filteredTasks.length} of {totalItems} tasks
            </div>
        );
    };

    // Render the task list with layout
    return (
        <>
            <TasksListLayout
                header={renderHeader()}
                content={renderContent()}
                footer={renderFooter()}
                className={className}
            />

            {/* Task View/Edit Dialog */}
            {/* <TaskViewDialog
                task={selectedTask}
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                onSave={handleSaveTask}
            /> */}
        </>
    );
}