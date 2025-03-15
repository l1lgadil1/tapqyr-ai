import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodoItem, TodoItemProps } from '../../../entities/todo';
import { Tabs, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { CheckCircle2, Clock, ListFilter, BrainCircuit, Search, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { useTranslation } from '../../../shared/lib/i18n';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';

export interface Todo extends Omit<TodoItemProps, 'onToggle' | 'onDelete' | 'onEdit' | 'className'> {
  createdAt: Date;
  isAIGenerated?: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  compact?: boolean;
  className?: string;
}

type FilterType = 'all' | 'active' | 'completed' | 'ai';
type SortType = 'newest' | 'oldest' | 'priority' | 'dueDate';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

export function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  compact = false,
  className,
}: TodoListProps) {
  const { t } = useTranslation('todo');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Reset filters when todos change significantly
  useEffect(() => {
    if (todos.length === 0) {
      setFilter('all');
      setSortBy('newest');
      setSearchQuery('');
      setPriorityFilter('all');
    }
  }, [todos.length === 0]);
  
  const filteredAndSortedTodos = useMemo(() => {
    // First apply search
    let filtered = todos;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(query) || 
        (todo.description && todo.description.toLowerCase().includes(query))
      );
    }
    
    // Then apply status filter
    filtered = filtered.filter((todo) => {
      if (filter === 'all') return true;
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      if (filter === 'ai') return todo.isAIGenerated;
      return true;
    });
    
    // Then apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(todo => todo.priority === priorityFilter);
    }
    
    // Then sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      
      if (sortBy === 'oldest') {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const aPriority = a.priority || 'medium';
        const bPriority = b.priority || 'medium';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      }
      
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });
  }, [todos, filter, sortBy, searchQuery, priorityFilter]);
  
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const aiGenerated = todos.filter(todo => todo.isAIGenerated).length;
    const highPriority = todos.filter(todo => todo.priority === 'high' && !todo.completed).length;
    
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, active, aiGenerated, highPriority, percentComplete };
  }, [todos]);
  
  const handleToggle = (id: string) => {
    onToggle(id);
  };
  
  const handleEdit = (id: string) => {
    onEdit(id);
  };
  
  const handleDelete = (id: string) => {
    onDelete(id);
  };
  
  const clearFilters = () => {
    setFilter('all');
    setSortBy('newest');
    setSearchQuery('');
    setPriorityFilter('all');
  };
  
  const hasActiveFilters = filter !== 'all' || sortBy !== 'newest' || searchQuery.trim() !== '' || priorityFilter !== 'all';
  
  if (!compact) {
    return (
      <div className={className}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold neon-text flex items-center">
              <span className="mr-2">{t('todoList.yourTasks')}</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="inline-block"
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </motion.div>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="flex items-center gap-1 bg-background/30">
                <Clock className="h-3 w-3 text-blue-500" />
                <span>{stats.active} {t('todoList.activeCount')}</span>
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1 bg-background/30">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>{stats.completed} {t('todoList.completedCount')}</span>
              </Badge>
              
              {stats.aiGenerated > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 bg-background/30">
                  <BrainCircuit className="h-3 w-3 text-purple-500" />
                  <span>{stats.aiGenerated} {t('todoList.aiGeneratedCount')}</span>
                </Badge>
              )}
              
              {stats.highPriority > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 bg-background/30">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>{stats.highPriority} high priority</span>
                </Badge>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full sm:w-48 data-bar mb-6 sm:mb-0 overflow-hidden rounded-full h-3 relative">
            <div 
              className="data-bar-fill absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${stats.percentComplete}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {stats.percentComplete}%
            </div>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 glass-panel p-3 mb-3">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${t('todoList.search')}...`}
                className="pl-9 bg-background/40 backdrop-blur-md border-primary/20"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="bg-background/40 backdrop-blur-md border-primary/20"
              onClick={() => setShowFilters(!showFilters)}
            >
              <ListFilter className="h-4 w-4 mr-2" />
              {t('todoList.filters')}
            </Button>
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                {t('todoList.clearFilters')}
              </Button>
            )}
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="glass-panel p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tab filters */}
                  <div>
                    <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)} className="w-full">
                      <TabsList className="grid grid-cols-4 w-full bg-background/40 backdrop-blur-md">
                        <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md">{t('todoList.all')}</TabsTrigger>
                        <TabsTrigger value="active" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md">{t('todoList.active')}</TabsTrigger>
                        <TabsTrigger value="completed" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md">{t('todoList.completed')}</TabsTrigger>
                        <TabsTrigger value="ai" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md flex items-center gap-1">
                          <BrainCircuit className="h-3 w-3" />
                          {t('todoList.ai')}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Priority filter */}
                    <div className="flex-1">
                      <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}>
                        <SelectTrigger className="w-full border-primary/20 bg-background/40 backdrop-blur-md">
                          <SelectValue placeholder={t('todoList.priorityFilter')} />
                        </SelectTrigger>
                        <SelectContent className="bg-background/80 backdrop-blur-md border border-primary/20">
                          <SelectItem value="all">{t('todoList.allPriorities')}</SelectItem>
                          <SelectItem value="low">{t('todoList.lowPriority')}</SelectItem>
                          <SelectItem value="medium">{t('todoList.mediumPriority')}</SelectItem>
                          <SelectItem value="high">{t('todoList.highPriority')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Sort options */}
                    <div className="flex-1">
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
                        <SelectTrigger className="w-full border-primary/20 bg-background/40 backdrop-blur-md">
                          <SelectValue placeholder={t('todoList.sortBy')} />
                        </SelectTrigger>
                        <SelectContent className="bg-background/80 backdrop-blur-md border border-primary/20">
                          <SelectItem value="newest">{t('todoList.newestFirst')}</SelectItem>
                          <SelectItem value="oldest">{t('todoList.oldestFirst')}</SelectItem>
                          <SelectItem value="priority">{t('todoList.priority')}</SelectItem>
                          <SelectItem value="dueDate">{t('todoList.dueDate')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence mode="wait">
          {filteredAndSortedTodos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn("space-y-3", compact && "space-y-2")}
            >
              {/* If there are more than one todo, add connecting lines */}
              {filteredAndSortedTodos.length > 1 && (
                filteredAndSortedTodos.map((todo, index) => (
                  <motion.div 
                    key={todo.id}
                    className="relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <TodoItem
                      {...todo}
                      onToggle={() => handleToggle(todo.id)}
                      onEdit={() => handleEdit(todo.id)}
                      onDelete={() => handleDelete(todo.id)}
                    />
                    {index < filteredAndSortedTodos.length - 1 && (
                      <div className="absolute left-[1.15rem] top-[2.5rem] w-px h-[calc(100%+0.75rem)] bg-primary/10 z-0"></div>
                    )}
                  </motion.div>
                ))
              )}
              
              {/* If there's only one todo, don't need connecting lines */}
              {filteredAndSortedTodos.length === 1 && (
                <TodoItem
                  {...filteredAndSortedTodos[0]}
                  onToggle={() => handleToggle(filteredAndSortedTodos[0].id)}
                  onEdit={() => handleEdit(filteredAndSortedTodos[0].id)}
                  onDelete={() => handleDelete(filteredAndSortedTodos[0].id)}
                  className={compact ? "py-2 px-3" : ""}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
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
                {searchQuery || filter !== 'all' || priorityFilter !== 'all' 
                  ? t('todoList.noMatchingTasks') 
                  : t('todoList.noTasks')}
              </h3>
              
              {(searchQuery || filter !== 'all' || priorityFilter !== 'all') && (
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
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // Compact view for dashboard widgets
  return (
    <div className={className}>
      {todos.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-2"
        >
          {todos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <TodoItem
                {...todo}
                onToggle={() => handleToggle(todo.id)}
                onEdit={() => handleEdit(todo.id)}
                onDelete={() => handleDelete(todo.id)}
                className="py-2 px-3"
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-6 glass-panel">
          <p className="text-muted-foreground">{t('todoList.noTasks')}</p>
        </div>
      )}
    </div>
  );
} 