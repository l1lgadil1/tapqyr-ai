import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodoItem, TodoItemProps } from '../../../entities/todo';
import { Tabs, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { CheckCircle2, Clock, ListFilter, BrainCircuit } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

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

export function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  compact = false,
  className,
}: TodoListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  
  const filteredAndSortedTodos = useMemo(() => {
    // First filter
    const filtered = todos.filter((todo) => {
      if (filter === 'all') return true;
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      if (filter === 'ai') return todo.isAIGenerated;
      return true;
    });
    
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
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return 0;
    });
  }, [todos, filter, sortBy]);
  
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const aiGenerated = todos.filter(todo => todo.isAIGenerated).length;
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, active, aiGenerated, percentComplete };
  }, [todos]);
  
  const handleToggle = (id: string) => {
    onToggle(id);
  };

  const handleEdit = (id: string) => {
    onEdit(id);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with stats - hide in compact mode */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold neon-text flex items-center">
              <span className="mr-2">Your Tasks</span>
              <motion.div 
                className="inline-block"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </motion.div>
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-blue-500" />
                {stats.active} active
              </span>
              <span className="w-px h-3 bg-border"></span>
              <span className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                {stats.completed} completed
              </span>
              {stats.aiGenerated > 0 && (
                <>
                  <span className="w-px h-3 bg-border"></span>
                  <span className="flex items-center">
                    <BrainCircuit className="h-3 w-3 mr-1 text-purple-500" />
                    {stats.aiGenerated} AI generated
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      )}
      
      {/* Progress bar - hide in compact mode */}
      {!compact && (
        <div className="w-full data-bar mb-6 overflow-hidden">
          <motion.div 
            className="data-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentComplete}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
      
      {/* Filter and sort controls - hide in compact mode */}
      {!compact && (
        <div className="flex flex-col sm:flex-row justify-between gap-3 glass-panel p-3 mb-6">
          <Tabs 
            value={filter} 
            onValueChange={(value) => setFilter(value as FilterType)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full bg-background/40 backdrop-blur-md">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md">All</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md">Active</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md">Completed</TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md flex items-center gap-1">
                <BrainCircuit className="h-3 w-3" />
                AI
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2 bg-background/40 backdrop-blur-md rounded-md px-3 py-1">
            <ListFilter className="h-4 w-4 text-primary" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
              <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-background/80 backdrop-blur-md border border-primary/20">
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="dueDate">Due date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* Todo items */}
      <AnimatePresence initial={false}>
        {filteredAndSortedTodos.length > 0 ? (
          <motion.ul 
            className={cn("space-y-3", compact && "space-y-2")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredAndSortedTodos.map((todo, index) => (
              <motion.li
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05 // Staggered animation
                }}
                className="relative"
              >
                {/* Connector line between tasks */}
                {index !== filteredAndSortedTodos.length - 1 && !compact && (
                  <div className="absolute left-[1.15rem] top-[2.5rem] w-px h-[calc(100%+0.75rem)] bg-primary/10 z-0"></div>
                )}
                
                <TodoItem
                  id={todo.id}
                  title={todo.title}
                  description={todo.description}
                  completed={todo.completed}
                  dueDate={todo.dueDate}
                  priority={todo.priority}
                  isAIGenerated={todo.isAIGenerated}
                  onToggle={handleToggle}
                  onDelete={onDelete}
                  onEdit={handleEdit}
                  className={compact ? "py-2 px-3" : ""}
                />
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
            <h3 className="mt-4 text-xl font-semibold neon-text">No tasks found</h3>
            <p className="text-muted-foreground">
              {filter !== 'all' 
                ? `No ${filter} tasks available`
                : 'Add a new task to get started'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 