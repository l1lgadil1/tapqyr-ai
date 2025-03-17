'use client';

import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../../../shared/lib/i18n';
import { Tabs, TabsContent } from '../../../shared/ui/tabs/tabs';
import { NavigationTabs } from '../../dashboard-page/ui/navigation-tabs';
import { useTodos } from '../hooks/useTodos';
import { TodoList } from '../../../widgets/todo-list';
import { TodoDashboard } from '../components/todo-dashboard';
import { useInView } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Todo Page Component
 * Displays all tasks with filtering and sorting options
 */
export function TodoPage() {
    const { t } = useTranslation(['todo', 'common']);
    const {
        todos,
        isLoading,
        error,
        totalItems,
        hasMore,
        fetchMoreTodos,
        deleteTodo,
        toggleTodo,
        setSortBy,
    } = useTodos();

    // Set up intersection observer for infinite scrolling with more conservative settings
    const { ref, inView } = useInView({
        threshold: 0.5, // Increase threshold to require more visibility
        triggerOnce: false,
        rootMargin: '100px', // Only trigger when element is 100px from viewport
        // Only observe if we have more items to load and we're not currently loading
        skip: !hasMore || isLoading || todos.length === 0,
    });

    const handleEditTodo = (id: string) => {
        // Implement edit functionality
        console.log('Edit todo', id);
    };

    // Load more todos when the user scrolls to the bottom - with debounce
    useEffect(() => {
        if (!inView || !hasMore || !fetchMoreTodos || isLoading) return;

        // Add debounce to prevent multiple calls
        const timer = setTimeout(() => {
            fetchMoreTodos();
        }, 0);

        return () => clearTimeout(timer);
    }, [inView, hasMore, fetchMoreTodos, isLoading]);

    return (
        <>
            <Helmet>
                <title>{t('allTasks')} | Tapqyr</title>
            </Helmet>

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <Tabs defaultValue="tasks" className="w-full">
                    <NavigationTabs activeTab="tasks" />

                    <TabsContent value="tasks" className="mt-0">
                        <div className="grid gap-6">
                            {/* Todo List */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4">{t('allTasks')}</h2>
                                <TodoList
                                    todos={todos}
                                    onToggleComplete={toggleTodo}
                                    onDelete={deleteTodo}
                                    onEdit={handleEditTodo}
                                    onSort={setSortBy}
                                    isLoading={isLoading}
                                    error={error}
                                    hasMore={hasMore}
                                    totalItems={totalItems}
                                    onLoadMore={fetchMoreTodos}
                                />
                                {/* Intersection observer target element */}
                                {hasMore && !isLoading && <div ref={ref} className="h-4 w-full" />}
                            </section>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
} 