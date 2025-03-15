'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodoList, Todo } from '../../../widgets/todo-list';
import { TodoForm } from '../../../features/todo-form';
import { AIPrompt } from '../../../features/ai-task-generator';
import { todoApi } from '../../../shared/api';
import { Button } from '../../../shared/ui/button';
import { Card, CardContent } from '../../../shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../../shared/lib/i18n';
import { 
  PlusCircle, 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Zap,
  Clock,
  Star,
  Filter,
  Search,
  BrainCircuit,
  Layers,
  Activity,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Input } from '../../../shared/ui/input';
import { Alert, AlertDescription } from '../../../shared/ui/alert';

export function TodoPage() {
  const { t } = useTranslation('todo');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'active'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Update URL when tab changes
  useEffect(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', activeTab);
      return newParams;
    });
  }, [activeTab, setSearchParams]);
  
  // Load todos from API on initial render
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedTodos = await todoApi.getAllTodos();
        setTodos(fetchedTodos);
      } catch (err) {
        console.error('Failed to fetch todos:', err);
        setError('Failed to load todos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTodos();
  }, []);
  
  // Helper function to redirect to all tasks tab with animation
  const redirectToAllTasks = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      setActiveTab('all');
      setIsRedirecting(false);
    }, 300);
  };
  
  const handleAddTodo = async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    try {
      setIsLoading(true);
      const newTodo = await todoApi.createTodo(todo);
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setIsFormOpen(false);
      redirectToAllTasks();
    } catch (err) {
      console.error('Failed to add todo:', err);
      setError('Failed to add todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateTodo = async (updatedTodo: Todo) => {
    try {
      setIsLoading(true);
      const { id, title, description, completed, dueDate, priority } = updatedTodo;
      const result = await todoApi.updateTodo(id, { title, description, completed, dueDate, priority });
      
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? result : todo)
      );
      
      setEditingTodo(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError('Failed to update todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteTodo = async (id: string) => {
    try {
      setIsLoading(true);
      await todoApi.deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('Failed to delete todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleTodo = async (id: string) => {
    try {
      const todoToToggle = todos.find(todo => todo.id === id);
      if (!todoToToggle) return;
      
      setIsLoading(true);
      const updatedTodo = await todoApi.updateTodo(id, { 
        ...todoToToggle, 
        completed: !todoToToggle.completed 
      });
      
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? updatedTodo : todo)
      );
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      setError('Failed to toggle todo status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditTodo = (id: string) => {
    const todoToEdit = todos.find(todo => todo.id === id);
    if (todoToEdit) {
      setEditingTodo(todoToEdit);
      setIsFormOpen(true);
    }
  };
  
  const handleAddAITodos = async (prompt: string) => {
    try {
      setIsLoading(true);
      const aiTodos = await todoApi.generateAITodos(prompt);
      setTodos(prevTodos => [...prevTodos, ...aiTodos]);
      redirectToAllTasks();
    } catch (err) {
      console.error('Failed to generate AI todos:', err);
      setError('Failed to generate AI tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter and search todos
  const filteredTodos = todos.filter(todo => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Priority filter
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'completed' && todo.completed) || 
      (filterStatus === 'active' && !todo.completed);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });
  
  // Get stats for dashboard
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  
  // Get todos due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayTodos = todos.filter(todo => {
    if (!todo.dueDate) return false;
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });
  
  // Get upcoming todos (due in the next 7 days)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const upcomingTodos = todos.filter(todo => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today && dueDate <= nextWeek;
  });
  
  // Get high priority todos
  const highPriorityTodos = todos.filter(todo => todo.priority === 'high' && !todo.completed);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  // Page transition variants
  const pageTransitionVariants = {
    exit: { opacity: 0, y: 20 },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      }
    }
  };
  
  // Render loading state
  if (isLoading && todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t('status.loading')}</p>
      </div>
    );
  }
  
  // Render error state
  if (error && todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} variant="outline">
          {t('actions.tryAgain')}
        </Button>
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {isRedirecting ? (
        <motion.div
          key="redirecting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-h-screen p-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">{t('status.updating')}</p>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={pageTransitionVariants}
          initial="exit"
          animate="enter"
          exit="exit"
          className="w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-8 relative z-10 hex-grid"
        >
          {/* Animated background elements */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer"></div>
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-shimmer" style={{ animationDelay: '3s' }}></div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x">
              {t('app.name', { ns: 'common' })}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <p className="text-muted-foreground">
                {t('app.tagline', { ns: 'common' })}
              </p>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>
          </motion.div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl glass-panel border-primary/20">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard')}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md"
                >
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('allTasks')}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="today" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('todayTasks')}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md"
                >
                  <BrainCircuit className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('aiAssistant')}</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                {/* Stats Cards */}
                <motion.div variants={itemVariants}>
                  <Card className="holographic-card overflow-hidden h-full">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="rounded-full bg-primary/10 p-3 mb-4 border border-primary/20">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold neon-text">{t('stats.total')}</h3>
                      <p className="text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{totalTodos}</p>
                      <div className="w-full mt-4 flex justify-between text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Activity className="h-3 w-3 mr-1 text-blue-500" />
                          {t('stats.active')}: {activeTodos}
                        </span>
                        <span className="flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                          {t('stats.completed')}: {completedTodos}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="holographic-card overflow-hidden h-full">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="rounded-full bg-green-500/10 p-3 mb-4 border border-green-500/20">
                        <Zap className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold neon-text">{t('stats.completionRate')}</h3>
                      <p className="text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">{completionRate}%</p>
                      <div className="w-full mt-4 data-bar">
                        <div 
                          className="data-bar-fill" 
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="holographic-card overflow-hidden h-full">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="rounded-full bg-blue-500/10 p-3 mb-4 border border-blue-500/20">
                        <Calendar className="h-6 w-6 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold neon-text">{t('stats.dueToday')}</h3>
                      <p className="text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">{todayTodos.length}</p>
                      <div className="w-full mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center justify-center">
                          <Clock className="h-3 w-3 mr-1 text-blue-500" />
                          {t('stats.upcomingDays')}: {upcomingTodos.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="holographic-card overflow-hidden h-full">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="rounded-full bg-red-500/10 p-3 mb-4 border border-red-500/20">
                        <Star className="h-6 w-6 text-red-500" />
                      </div>
                      <h3 className="text-xl font-semibold neon-text">{t('highPriority')}</h3>
                      <p className="text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">{highPriorityTodos.length}</p>
                      <div className="w-full mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center justify-center">
                          <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                          {t('stats.requiresAttention')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              
              {/* Recent and Priority Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  variants={itemVariants}
                  className="holographic-card rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center neon-text">
                    <Clock className="mr-2 h-5 w-5 text-blue-500" />
                    {t('stats.dueToday')}
                  </h3>
                  {todayTodos.length > 0 ? (
                    <TodoList 
                      todos={todayTodos}
                      onToggle={handleToggleTodo}
                      onEdit={handleEditTodo}
                      onDelete={handleDeleteTodo}
                      compact
                    />
                  ) : (
                    <div className="text-center py-6 bg-background/10 backdrop-blur-sm rounded-lg border border-primary/10">
                      <Calendar className="mx-auto h-10 w-10 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground mt-2">{t('empty.today')}</p>
                    </div>
                  )}
                </motion.div>
                
                <motion.div
                  variants={itemVariants}
                  className="holographic-card rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center neon-text">
                    <Star className="mr-2 h-5 w-5 text-red-500" />
                    {t('stats.highPriorityTasks')}
                  </h3>
                  {highPriorityTodos.length > 0 ? (
                    <TodoList 
                      todos={highPriorityTodos}
                      onToggle={handleToggleTodo}
                      onEdit={handleEditTodo}
                      onDelete={handleDeleteTodo}
                      compact
                    />
                  ) : (
                    <div className="text-center py-6 bg-background/10 backdrop-blur-sm rounded-lg border border-primary/10">
                      <Star className="mx-auto h-10 w-10 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground mt-2">{t('empty.highPriority')}</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </TabsContent>
            
            {/* All Tasks Tab */}
            <TabsContent value="all">
              <div className="holographic-card rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('filters.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-[300px] bg-background/50 border-primary/20 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto glass-panel p-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <select 
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                      className="bg-background/50 border-0 rounded-md px-3 py-2 text-sm focus:ring-0"
                    >
                      <option value="all">{t('filters.allPriorities')}</option>
                      <option value="high">{t('filters.highPriority')}</option>
                      <option value="medium">{t('filters.mediumPriority')}</option>
                      <option value="low">{t('filters.lowPriority')}</option>
                    </select>
                    
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'active')}
                      className="bg-background/50 border-0 rounded-md px-3 py-2 text-sm focus:ring-0"
                    >
                      <option value="all">{t('filters.allStatus')}</option>
                      <option value="active">{t('filters.active')}</option>
                      <option value="completed">{t('filters.completed')}</option>
                    </select>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setEditingTodo(null);
                      setIsFormOpen(true);
                    }}
                    className="w-full sm:w-auto cyber-button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('form.addTask')}
                  </Button>
                </div>
                
                <hr className="my-4 border-t border-primary/10" />
                
                {filteredTodos.length > 0 ? (
                  <TodoList 
                    todos={filteredTodos}
                    onToggle={handleToggleTodo}
                    onEdit={handleEditTodo}
                    onDelete={handleDeleteTodo}
                  />
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                    <h3 className="mt-4 text-xl font-semibold neon-text">{t('empty.all')}</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || filterPriority !== 'all' || filterStatus !== 'all' 
                        ? t('empty.adjustFilters')
                        : t('empty.addNewToStart')}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Today Tab */}
            <TabsContent value="today">
              <div className="holographic-card rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold flex items-center neon-text">
                    <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                    {t('todayTasks')}
                  </h2>
                  
                  <Button 
                    onClick={() => {
                      setEditingTodo(null);
                      setIsFormOpen(true);
                    }}
                    className="cyber-button group relative overflow-hidden"
                    disabled={isLoading}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 duration-300" />
                    <span className="relative z-10">{t('form.addTask')}</span>
                  </Button>
                </div>
                
                <hr className="my-4 border-t border-primary/10" />
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          rotate: 360,
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="mx-auto h-8 w-8 text-primary mb-4"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" strokeOpacity="0.2" />
                          <path d="M12 2C6.47715 2 2 6.47715 2 12" strokeLinecap="round" />
                        </svg>
                      </motion.div>
                      <p className="text-muted-foreground">{t('loading')}</p>
                    </div>
                  </div>
                ) : todayTodos.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TodoList 
                      todos={todayTodos}
                      onToggle={handleToggleTodo}
                      onEdit={handleEditTodo}
                      onDelete={handleDeleteTodo}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-12 glass-panel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
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
                      <Calendar className="w-full h-full" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{t('noTasksForToday')}</h3>
                    <p className="text-muted-foreground mb-4">{t('addTasksForToday')}</p>
                    <Button 
                      onClick={() => {
                        setEditingTodo(null);
                        setIsFormOpen(true);
                      }}
                      className="cyber-button-secondary"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {t('form.addTask')}
                    </Button>
                  </motion.div>
                )}
                
                {upcomingTodos.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold mt-8 mb-4 neon-text">{t('upcomingTasks')}</h3>
                    <TodoList 
                      todos={upcomingTodos}
                      onToggle={handleToggleTodo}
                      onEdit={handleEditTodo}
                      onDelete={handleDeleteTodo}
                    />
                  </>
                )}
              </div>
            </TabsContent>
            
            {/* AI Assistant Tab */}
            <TabsContent value="ai">
              <div className="holographic-card rounded-lg p-4 sm:p-6 md:p-8 max-w-full">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4 border border-primary/20">
                    <BrainCircuit className="h-8 w-8 text-primary animate-pulse-glow" />
                  </div>
                  <h2 className="text-2xl font-bold neon-text">{t('aiAssistant')}</h2>
                  <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
                    {t('ai.description')}
                  </p>
                </div>
                
                <div className="max-w-5xl mx-auto">
                  <AIPrompt onAddTodos={handleAddAITodos} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Todo Form Modal */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-lg"
                >
                  <TodoForm 
                    todo={editingTodo}
                    onSubmit={(todoData) => {
                      if (editingTodo) {
                        handleUpdateTodo({
                          ...editingTodo,
                          ...todoData
                        });
                      } else {
                        handleAddTodo(todoData);
                      }
                    }}
                    onCancel={() => {
                      setIsFormOpen(false);
                      setEditingTodo(null);
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 