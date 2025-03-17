import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodoItem as TodoItemComponent } from '../../../entities/todo/ui/todo-item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { CheckCircle2, Clock, ListFilter, BrainCircuit, X } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { useTranslation } from '../../../shared/lib/i18n';
import { Button } from '../../../shared/ui/button';
import { TodoListGrouped } from '../../../pages/todo-page/components/todo-list-grouped';
import { TodoListProps, SortType, FilterType, PriorityFilter, TodoItem } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function TodoList({
  todos,
  onToggleComplete,
  onDelete,
  onEdit,
  onSort,
  compact = false,
  className,
  isLoading = false,
  error = null,
  hasMore = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  onLoadMore,
  updatingTodoIds = new Set(),
}: TodoListProps) {
  const { t } = useTranslation('todo');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [filter, setFilter] = useState<FilterType>(() => 
    (searchParams.get('status') as FilterType) || 'all'
  );
  const [sortBy, setSortBy] = useState<SortType>(() => 
    (searchParams.get('sort') as SortType) || 'newest'
  );
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(() => 
    (searchParams.get('priority') as PriorityFilter) || 'all'
  );
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  const updateURL = useCallback((newFilter: FilterType, newSort: SortType, newPriority: PriorityFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilter !== 'all') {
      params.set('status', newFilter);
    } else {
      params.delete('status');
    }
    
    if (newSort !== 'newest') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    
    if (newPriority !== 'all') {
      params.set('priority', newPriority);
    } else {
      params.delete('priority');
    }
    
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Update filters and URL
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
    updateURL(newFilter, sortBy, priorityFilter);
  }, [sortBy, priorityFilter, updateURL]);

  const handleSortChange = useCallback((newSort: SortType) => {
    setSortBy(newSort);
    updateURL(filter, newSort, priorityFilter);
    if (onSort) {
      onSort(newSort);
    }
  }, [filter, priorityFilter, onSort, updateURL]);

  const handlePriorityChange = useCallback((newPriority: PriorityFilter) => {
    setPriorityFilter(newPriority);
    updateURL(filter, sortBy, newPriority);
  }, [filter, sortBy, updateURL]);

  const clearFilters = useCallback(() => {
    setFilter('all');
    setSortBy('newest');
    setPriorityFilter('all');
    navigate(window.location.pathname);
  }, [navigate]);
  
  useEffect(() => {
    if (todos.length === 0) {
      setFilter('all');
      setSortBy('newest');
      setPriorityFilter('all');
    }
  }, [todos.length]);
  
  useEffect(() => {
    if (onSort) {
      onSort(sortBy);
    }
  }, [sortBy, onSort]);
  
  // Memoize handlers
  const handleToggle = useCallback((id: string) => {
    onToggleComplete(id);
  }, [onToggleComplete]);

  const handleEdit = useCallback((id: string) => {
    onEdit(id);
  }, [onEdit]);

  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);
  
  // Memoize filtered todos
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filter === 'all') return true;
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      if (filter === 'ai') return todo.isAIGenerated;
      return true;
    }).filter(todo => {
      if (priorityFilter === 'all') return true;
      return todo.priority === priorityFilter;
    });
  }, [todos, filter, priorityFilter]);

  // Memoize sorted todos
  const sortedTodos = useMemo(() => {
    return [...filteredTodos].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority': {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority || 'medium'] ?? 1) - (priorityOrder[b.priority || 'medium'] ?? 1);
        }
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [filteredTodos, sortBy]);

  // Memoize stats
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const aiGenerated = todos.filter(todo => todo.isAIGenerated).length;
    const highPriority = todos.filter(todo => todo.priority === 'high' && !todo.completed).length;
    const mediumPriority = todos.filter(todo => todo.priority === 'medium' && !todo.completed).length;
    const lowPriority = todos.filter(todo => todo.priority === 'low' && !todo.completed).length;
    
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { 
      total, 
      completed, 
      active, 
      aiGenerated, 
      highPriority, 
      mediumPriority, 
      lowPriority, 
      percentComplete 
    };
  }, [todos]);
  
  const hasActiveFilters = filter !== 'all' || sortBy !== 'newest' || priorityFilter !== 'all';
  
  const renderTodoItem = (todo: TodoItem) => {
    // Ensure completed is a boolean
    const processedTodo = {
      ...todo,
      completed: typeof todo.completed === 'string' ? todo.completed === 'true' : Boolean(todo.completed),
    };

    return (
      <TodoItemComponent
        key={processedTodo.id}
        id={processedTodo.id}
        title={processedTodo.title}
        completed={processedTodo.completed}
        priority={processedTodo.priority}
        dueDate={processedTodo.dueDate}
        isAIGenerated={processedTodo.isAIGenerated}
        isUpdating={updatingTodoIds.has(processedTodo.id)}
        onToggle={handleToggle}
        onDelete={() => handleDelete(processedTodo.id)}
        onEdit={() => handleEdit(processedTodo.id)}
        className="w-full"
      />
    );
  };
  
  if (!compact) {
    return (
      <div className={className}>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center py-12 glass-panel"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                  <path d="M7.5 12L10.5 15L16.5 9" />
                  <circle cx="12" cy="12" r="11" className="opacity-10" />
                  <path className="opacity-30" d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12" />
                </svg>
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2">
                {filter !== 'all' || priorityFilter !== 'all' 
                  ? t('todoList.noMatchingTasks') 
                  : t('todoList.noTasks')}
              </h3>
              
              {(filter !== 'all' || priorityFilter !== 'all') && (
                <p className="text-muted-foreground mb-4">
                  {t('todoList.tryAdjustingFilters')}
                </p>
              )}
              
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('todoList.clearFilters')}
                </Button>
              )}
            </motion.div>
          ) : isLoading && sortedTodos.length === 0 ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg border">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sortedTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center py-12 glass-panel"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                  <path d="M7.5 12L10.5 15L16.5 9" />
                  <circle cx="12" cy="12" r="11" className="opacity-10" />
                  <path className="opacity-30" d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12" />
                </svg>
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2">
                {filter !== 'all' || priorityFilter !== 'all' 
                  ? t('todoList.noMatchingTasks') 
                  : t('todoList.noTasks')}
              </h3>
              
              {(filter !== 'all' || priorityFilter !== 'all') && (
                <p className="text-muted-foreground mb-4">
                  {t('todoList.tryAdjustingFilters')}
                </p>
              )}
              
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('todoList.clearFilters')}
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {filter === 'all' && !compact ? (
                <TodoListGrouped
                  todos={sortedTodos}
                  renderTodoItem={renderTodoItem}
                  hasMore={hasMore}
                  isLoading={isLoading}
                  onLoadMore={onLoadMore}
                />
              ) : (
                sortedTodos.map((todo) => renderTodoItem(todo))
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {stats.percentComplete > 0 && stats.percentComplete < 100 && (
          <motion.p 
            className="text-xs text-muted-foreground text-center mt-1 animate-pulse-slow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('todoList.keepGoing')}
          </motion.p>
        )}
        {stats.percentComplete === 100 && (
          <motion.p 
            className="text-xs text-green-500 text-center mt-1 font-medium animate-pulse-slow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('todoList.allTasksCompleted')}
          </motion.p>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and sorting */}
      {!compact && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <ListFilter className="h-4 w-4" />
              {t('todoList.filters')}
              {(filter !== 'all' || priorityFilter !== 'all') && (
                <span className="ml-1 rounded-full bg-primary w-2 h-2" />
              )}
            </Button>
            
            {(filter !== 'all' || priorityFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                {t('todoList.clearFilters')}
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('todoList.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('todoList.newestFirst')}</SelectItem>
                <SelectItem value="oldest">{t('todoList.oldestFirst')}</SelectItem>
                <SelectItem value="priority">{t('todoList.byPriority')}</SelectItem>
                <SelectItem value="dueDate">{t('todoList.byDueDate')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && !compact && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg border mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">{t('todoList.status')}</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filter === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('all')}
                    className="flex items-center gap-1"
                  >
                    {t('todoList.all')}
                  </Button>
                  <Button
                    variant={filter === 'active' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('active')}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {t('todoList.active')}
                  </Button>
                  <Button
                    variant={filter === 'completed' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('completed')}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {t('todoList.completed')}
                  </Button>
                  {stats.aiGenerated > 0 && (
                    <Button
                      variant={filter === 'ai' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('ai')}
                      className="flex items-center gap-1"
                    >
                      <BrainCircuit className="h-3 w-3" />
                      {t('todoList.aiGenerated')}
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">{t('todoList.priority')}</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={priorityFilter === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePriorityChange('all')}
                  >
                    {t('todoList.all')}
                  </Button>
                  <Button
                    variant={priorityFilter === 'high' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePriorityChange('high')}
                    className="text-destructive border-destructive/50"
                  >
                    {t('todoList.highPriority')}
                  </Button>
                  <Button
                    variant={priorityFilter === 'medium' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePriorityChange('medium')}
                  >
                    {t('todoList.mediumPriority')}
                  </Button>
                  <Button
                    variant={priorityFilter === 'low' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePriorityChange('low')}
                  >
                    {t('todoList.lowPriority')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Todo items */}
      {sortedTodos.length > 0 ? (
        <AnimatePresence initial={false}>
          {sortedTodos.map(todo => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <TodoItemComponent
                {...todo}
                isUpdating={updatingTodoIds.has(todo.id)}
                onToggle={handleToggle}
                onEdit={() => handleEdit(todo.id)}
                onDelete={() => handleDelete(todo.id)}
                className="py-2 px-3"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-muted-foreground opacity-20">
            {filter === 'completed' ? (
              <CheckCircle2 className="h-full w-full" />
            ) : filter === 'ai' ? (
              <BrainCircuit className="h-full w-full" />
            ) : (
              <Clock className="h-full w-full" />
            )}
          </div>
          <h3 className="mt-4 text-lg font-semibold">{t('todoList.noTasks')}</h3>
          <p className="text-muted-foreground">
            {t('todoList.noTasksDescription')}
          </p>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination info */}
      {!isLoading && sortedTodos.length > 0 && totalItems > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-2">
          {t('todoList.showing')} {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-
          {Math.min(currentPage * pageSize, totalItems)} {t('todoList.of')} {totalItems} {t('todoList.items')}
        </div>
      )}
      
      {/* Load more indicator */}
      {hasMore && !isLoading && (
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">{t('todoList.loadMore')}</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}
    </div>
  );
} 