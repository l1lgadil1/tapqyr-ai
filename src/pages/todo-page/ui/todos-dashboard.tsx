import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../../../shared/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import {
  CheckCircle, Clock, AlertTriangle, Calendar, BarChart3
} from 'lucide-react';
import { useTasks } from '../../../features/tasks-list/model/hooks/use-tasks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs/tabs';
import { NavigationTabs } from '../../../widgets/navigation-tabs/ui/navigation-tabs';

export function TodosDashboard() {
  const { t } = useTranslation(['todo', 'common']);
  
  // Fetch task statistics
  const {
    tasks,
    isLoading,
    error,
    totalItems,
    stats
  } = useTasks({
    view: 'all',
    filter: 'all',
    skipInitialFetch: false
  });

  // Calculate statistics if not provided by the API
  const calculatedStats = {
    totalTodos: totalItems || tasks.length,
    completedTodos: tasks.filter(task => task.completed).length,
    activeTodos: tasks.filter(task => !task.completed).length,
    highPriorityTodos: tasks.filter(task => task.priority === 'high').length,
    mediumPriorityTodos: tasks.filter(task => task.priority === 'medium').length,
    lowPriorityTodos: tasks.filter(task => task.priority === 'low').length,
    completionRate: totalItems > 0 
      ? Math.round((tasks.filter(task => task.completed).length / totalItems) * 100) 
      : 0
  };

  // Use API stats if available, otherwise use calculated stats
  const displayStats = stats || calculatedStats;
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-destructive font-medium">{error}</div>
        <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('todosDashboard', { defaultValue: 'Todos Dashboard' })} | Tapqyr</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">{t('todosDashboard', { defaultValue: 'Todos Dashboard' })}</h1>
        
        <Tabs defaultValue="overview" className="w-full mb-8">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">{t('overview', { defaultValue: 'Overview' })}</TabsTrigger>
            <TabsTrigger value="active">{t('active', { defaultValue: 'Active' })}</TabsTrigger>
            <TabsTrigger value="completed">{t('completed', { defaultValue: 'Completed' })}</TabsTrigger>
            <TabsTrigger value="priority">{t('priority', { defaultValue: 'Priority' })}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Key Metrics */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('keyMetrics', { defaultValue: 'Key Metrics' })}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Tasks */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      {t('totalTasks', { defaultValue: 'Total Tasks' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{displayStats.totalTodos}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('allTasks', { defaultValue: 'All tasks in your system' })}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Completed Tasks */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('completedTasks', { defaultValue: 'Completed Tasks' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{displayStats.completedTodos}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {displayStats.completionRate}% {t('completionRate', { defaultValue: 'completion rate' })}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Active Tasks */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      {t('activeTasks', { defaultValue: 'Active Tasks' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{displayStats.activeTodos}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('pendingCompletion', { defaultValue: 'Pending completion' })}
                    </p>
                  </CardContent>
                </Card>
                
                {/* High Priority Tasks */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      {t('highPriorityTasks', { defaultValue: 'High Priority Tasks' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{displayStats.highPriorityTodos}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('needsAttention', { defaultValue: 'Needs immediate attention' })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            {/* Task Breakdown */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('taskBreakdown', { defaultValue: 'Task Breakdown' })}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task Status */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      {t('tasksByStatus', { defaultValue: 'Tasks by Status' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Completion Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{t('completed', { defaultValue: 'Completed' })}</span>
                          <span className="text-sm font-medium">{displayStats.completionRate}%</span>
                        </div>
                        <div className="w-full bg-secondary/30 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${displayStats.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Active Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{t('active', { defaultValue: 'Active' })}</span>
                          <span className="text-sm font-medium">
                            {100 - displayStats.completionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary/30 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${100 - displayStats.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual representation */}
                    <div className="mt-6 flex justify-center">
                      <div className="flex gap-8">
                        <div className="flex flex-col items-center">
                          <div className="h-24 w-24 rounded-full border-8 border-green-500 flex items-center justify-center">
                            <span className="text-lg font-bold">{displayStats.completedTodos}</span>
                          </div>
                          <span className="mt-2 text-sm">{t('completed', { defaultValue: 'Completed' })}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-24 w-24 rounded-full border-8 border-blue-500 flex items-center justify-center">
                            <span className="text-lg font-bold">{displayStats.activeTodos}</span>
                          </div>
                          <span className="mt-2 text-sm">{t('active', { defaultValue: 'Active' })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Priority Distribution */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      {t('tasksByPriority', { defaultValue: 'Tasks by Priority' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* High Priority */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            {t('highPriority', { defaultValue: 'High Priority' })}
                          </span>
                          <span className="text-sm font-medium">
                            {displayStats.totalTodos > 0 
                              ? Math.round((displayStats.highPriorityTodos / displayStats.totalTodos) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary/30 rounded-full h-2.5">
                          <div 
                            className="bg-red-500 h-2.5 rounded-full" 
                            style={{ 
                              width: `${displayStats.totalTodos > 0 
                                ? Math.round((displayStats.highPriorityTodos / displayStats.totalTodos) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Medium Priority */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-3 w-3 text-amber-500" />
                            {t('mediumPriority', { defaultValue: 'Medium Priority' })}
                          </span>
                          <span className="text-sm font-medium">
                            {displayStats.totalTodos > 0 
                              ? Math.round((calculatedStats.mediumPriorityTodos / displayStats.totalTodos) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary/30 rounded-full h-2.5">
                          <div 
                            className="bg-amber-500 h-2.5 rounded-full" 
                            style={{ 
                              width: `${displayStats.totalTodos > 0 
                                ? Math.round((calculatedStats.mediumPriorityTodos / displayStats.totalTodos) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Low Priority */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {t('lowPriority', { defaultValue: 'Low Priority' })}
                          </span>
                          <span className="text-sm font-medium">
                            {displayStats.totalTodos > 0 
                              ? Math.round((calculatedStats.lowPriorityTodos / displayStats.totalTodos) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary/30 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ 
                              width: `${displayStats.totalTodos > 0 
                                ? Math.round((calculatedStats.lowPriorityTodos / displayStats.totalTodos) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual representation */}
                    <div className="mt-6 flex justify-center">
                      <div className="grid grid-cols-3 gap-4 w-full">
                        <div className="flex flex-col items-center">
                          <div className="w-full aspect-square rounded-md bg-red-500/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-red-500">{displayStats.highPriorityTodos}</span>
                          </div>
                          <span className="mt-2 text-xs text-center">{t('high', { defaultValue: 'High' })}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full aspect-square rounded-md bg-amber-500/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-amber-500">{calculatedStats.mediumPriorityTodos}</span>
                          </div>
                          <span className="mt-2 text-xs text-center">{t('medium', { defaultValue: 'Medium' })}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full aspect-square rounded-md bg-green-500/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-green-500">{calculatedStats.lowPriorityTodos}</span>
                          </div>
                          <span className="mt-2 text-xs text-center">{t('low', { defaultValue: 'Low' })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            {/* Recent Activity */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('recentActivity', { defaultValue: 'Recent Activity' })}</h2>
              <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                        <div className={`w-2 h-2 mt-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                              {task.title}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                              task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-green-500/10 text-green-500'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description.length > 100 
                                ? `${task.description.substring(0, 100)}...` 
                                : task.description}
                            </p>
                          )}
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'No date'}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {tasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6">
                        <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {t('noRecentActivity', { defaultValue: 'No recent activity to display' })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
            
            {/* Task Management Tips */}
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('productivityTips', { defaultValue: 'Productivity Tips' })}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {t('prioritizeTasks', { defaultValue: 'Prioritize Tasks' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t('prioritizeTasksTip', { defaultValue: 'Focus on high-priority tasks first to make the most impact on your productivity.' })}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {t('timeboxing', { defaultValue: 'Use Timeboxing' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t('timeboxingTip', { defaultValue: 'Allocate specific time blocks for tasks to improve focus and prevent work from expanding unnecessarily.' })}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      {t('trackProgress', { defaultValue: 'Track Progress' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t('trackProgressTip', { defaultValue: 'Regularly review your task completion rate to stay motivated and identify improvement areas.' })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="active">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('activeTasks', { defaultValue: 'Active Tasks' })}</h2>
              <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{t('activeTasks', { defaultValue: 'Active Tasks' })}</h3>
                      <p className="text-sm text-muted-foreground">{t('pendingCompletion', { defaultValue: 'Pending completion' })}</p>
                    </div>
                    <div className="text-3xl font-bold">{displayStats.activeTodos}</div>
                  </div>
                  
                  <div className="mt-4">
                    {displayStats.activeTodos > 0 ? (
                      <div className="space-y-4">
                        {/* Active tasks would be displayed here */}
                        <div className="text-sm text-muted-foreground">
                          {t('viewTaskList', { defaultValue: 'View complete task list to see active tasks' })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p>{t('noActiveTasks', { defaultValue: 'No active tasks' })}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
          
          <TabsContent value="completed">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('completedTasks', { defaultValue: 'Completed Tasks' })}</h2>
              <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{t('completedTasks', { defaultValue: 'Completed Tasks' })}</h3>
                      <p className="text-sm text-muted-foreground">
                        {displayStats.completionRate}% {t('completionRate', { defaultValue: 'completion rate' })}
                      </p>
                    </div>
                    <div className="text-3xl font-bold">{displayStats.completedTodos}</div>
                  </div>
                  
                  <div className="mt-4">
                    {displayStats.completedTodos > 0 ? (
                      <div className="space-y-4">
                        {/* Completed tasks would be displayed here */}
                        <div className="text-sm text-muted-foreground">
                          {t('viewTaskList', { defaultValue: 'View complete task list to see completed tasks' })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p>{t('noCompletedTasks', { defaultValue: 'No completed tasks' })}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
          
          <TabsContent value="priority">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('priorityTasks', { defaultValue: 'Tasks by Priority' })}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* High Priority */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      {t('highPriority', { defaultValue: 'High Priority' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{displayStats.highPriorityTodos}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('needsAttention', { defaultValue: 'Needs immediate attention' })}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Medium Priority */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      {t('mediumPriority', { defaultValue: 'Medium Priority' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{calculatedStats.mediumPriorityTodos}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('plannedTasks', { defaultValue: 'Planned tasks' })}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Low Priority */}
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      {t('lowPriority', { defaultValue: 'Low Priority' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{calculatedStats.lowPriorityTodos}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('whenPossible', { defaultValue: 'Complete when possible' })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 