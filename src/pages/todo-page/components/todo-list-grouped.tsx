'use client';

import { useMemo, useRef, useEffect } from 'react';
import { isToday, isYesterday, isSameWeek, isSameMonth } from 'date-fns';
import { TodoItem } from '../../../widgets/todo-list/types';
import { ScrollArea } from '../../../shared/ui/scroll-area';
import { Separator } from '../../../shared/ui/separator';
import { useTranslation } from '../../../shared/lib/i18n';

interface TodoListGroupedProps {
  todos: TodoItem[];
  renderTodoItem: (todo: TodoItem) => React.ReactNode;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

interface GroupedTodos {
  [key: string]: {
    title: string;
    todos: TodoItem[];
  };
}

export function TodoListGrouped({ 
  todos, 
  renderTodoItem, 
  hasMore = false,
  isLoading = false,
  onLoadMore 
}: TodoListGroupedProps) {
  const { t } = useTranslation('todo');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  const groupedTodos = useMemo(() => {
    return todos.reduce<GroupedTodos>((acc, todo) => {
      const createdAt = new Date(todo.createdAt);
      let groupKey: string;
      let groupTitle: string;

      if (isToday(createdAt)) {
        groupKey = 'today';
        groupTitle = t('dateGroups.today');
      } else if (isYesterday(createdAt)) {
        groupKey = 'yesterday';
        groupTitle = t('dateGroups.yesterday');
      } else if (isSameWeek(createdAt, new Date(), { weekStartsOn: 1 })) {
        groupKey = 'thisWeek';
        groupTitle = t('dateGroups.thisWeek');
      } else if (isSameMonth(createdAt, new Date())) {
        groupKey = 'thisMonth';
        groupTitle = t('dateGroups.thisMonth');
      } else {
        groupKey = 'older';
        groupTitle = t('dateGroups.older');
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          title: groupTitle,
          todos: [],
        };
      }

      // Convert string completed value to boolean if needed
      const processedTodo = {
        ...todo,
        completed: typeof todo.completed === 'string' ? todo.completed === 'true' : todo.completed,
      };

      acc[groupKey].todos.push(processedTodo);
      return acc;
    }, {});
  }, [todos, t]);

  const orderedGroups = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older'];

  return (
    <ScrollArea className=" pr-4">
      <div className="space-y-8">
        {orderedGroups.map((groupKey) => {
          const group = groupedTodos[groupKey];
          if (!group || group.todos.length === 0) return null;

          return (
            <div key={groupKey} className="space-y-4">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.title}
                </h3>
                <Separator className="mt-2" />
              </div>
              <div className="space-y-4">
                {group.todos.map((todo) => (
                  <div key={todo.id} className="animate-in fade-in slide-in-from-bottom-5">
                    {renderTodoItem(todo)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Loading indicator and intersection observer trigger */}
        {(hasMore || isLoading) && (
          <div
            ref={loadMoreRef}
            className="py-4 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <div className="h-2 w-2 bg-primary rounded-full" />
                <div className="h-2 w-2 bg-primary rounded-full" />
              </div>
            ) : (
              <div className="h-8 w-8 opacity-0">·</div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
} 