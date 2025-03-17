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

export interface TasksListProps {
    className?: string;
}

export function TasksList({ className }: TasksListProps = {}) {
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
        editTask,
        fetchTasks,
    } = useTasks({
        autoFetch: true,
        initialParams: { limit: 10, offset: 0 },
    });

    // Track the last filter state to detect changes
    const [filterChangeCounter, setFilterChangeCounter] = useState(0);

    // Track if we're currently loading more items to prevent duplicate requests
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        onFilter: (params) => {
            fetchTasks({ ...params, offset: 0 });
            setFilterChangeCounter((prev) => prev + 1); // Increment counter on filter change
        },
        onSort: (sortBy) => {
            fetchTasks({ sortBy, offset: 0 });
            setFilterChangeCounter((prev) => prev + 1); // Increment counter on sort change
        },
        clientSideFiltering: false,
    });

    // Apply client-side filtering if needed
    const filteredTasks = filterTasks(tasks);

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

    // Render header
    const renderHeader = () => (
        <>
            <TasksSearch value={search} onChange={handleSearchChange} onClear={handleSearchClear} />
            <div className="flex flex-wrap items-center gap-2">
                <TasksSort value={sortBy} onChange={handleSortChange} />
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
                        {search
                            ? 'Try adjusting your search or filters'
                            : 'Create a new task to get started'}
                    </p>
                </div>
            );
        }

        return (
            <div className="overflow-auto max-h-[calc(100vh-300px)] min-h-[400px]">
                <div className="p-2 space-y-2">
                    <AnimatePresence mode="wait" initial={false}>
                        {filteredTasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                layout>
                                <TaskItem
                                    id={task.id}
                                    title={task.title}
                                    description={task.description}
                                    completed={task.completed}
                                    priority={task.priority}
                                    estimatedTime={task.estimatedTime}
                                    isUpdating={updatingTaskIds.has(task.id)}
                                    onToggle={toggleTaskCompletion}
                                    onDelete={deleteTask}
                                    onEdit={editTask}
                                />
                                {/* Only add the intersection observer to the last item */}
                                {index === filteredTasks.length - 1 && (
                                    <div
                                        ref={ref}
                                        className="h-10 w-full flex items-center justify-center">
                                        {isLoading && hasMore && (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-5 w-5 animate-spin text-primary/70" />
                                                <span className="ml-2 text-sm text-muted-foreground">
                                                    Loading more...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    // Render footer with task count
    const renderFooter = () => {
        if (filteredTasks.length === 0) return null;

        return (
            <div className="text-xs text-muted-foreground text-center">
                Showing {filteredTasks.length} of {totalItems} tasks
                {hasMore ? (
                    <button 
                        onClick={() => loadMore()} 
                        className="ml-2 text-primary hover:underline focus:outline-none"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Load more'}
                    </button>
                ) : null}
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