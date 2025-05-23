'use client';

import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../../../shared/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs/tabs';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { useDashboardTodos } from '../hooks/useDashboardTodos';
import { DashboardTodoList } from './dashboard-todo-list';

/**
 * Dashboard Page Component
 * Displays analytics, today's tasks, and other important information
 */
export function DashboardPage() {
  const { t } = useTranslation(['todo', 'common']);
  const { 
    todayTodos, 
    upcomingTodos, 
    stats
  } = useDashboardTodos();
  
  return (
    <>
      <Helmet>
        <title>{t('dashboard')} | Tapqyr</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="dashboard">{t('dashboard', { defaultValue: 'Dashboard' })}</TabsTrigger>
            <TabsTrigger value="tasks">{t('tasks', { defaultValue: 'Tasks' })}</TabsTrigger>
            <TabsTrigger value="analytics">{t('analytics', { defaultValue: 'Analytics' })}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-0">
            <div className="grid gap-6">
              {/* Analytics Overview */}
              <section>
                <h2 className="text-2xl font-bold mb-4">{t('analyticsOverview', { defaultValue: 'Analytics Overview' })}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {t('completedTasks', { defaultValue: 'Completed Tasks' })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.completedTasks}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.completionRate}% {t('completionRate', { defaultValue: 'Completion Rate' })}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        {t('pendingTasks', { defaultValue: 'Pending Tasks' })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingTasks}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {todayTodos.items.length} {t('dueSoon', { defaultValue: 'due soon' })}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {t('overdueTasks', { defaultValue: 'Overdue Tasks' })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.overdueTasks}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('requiresAttention', { defaultValue: 'Requires attention' })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>
              
              {/* Today's Tasks */}
              <section>
                <h2 className="text-2xl font-bold mb-4">{t('todayTasks')}</h2>
                <DashboardTodoList
                  todos={todayTodos.items}
                  isLoading={todayTodos.isLoading}
                  error={todayTodos.error}
                  totalItems={todayTodos.totalItems}
                  emptyMessage={t('noTasksToday', { defaultValue: 'No tasks scheduled for today' })}
                  viewAllLink="/todo"
                  viewAllLabel={t('viewAllTasks', { defaultValue: 'View All Tasks' })}
                  hasMore={todayTodos.hasMore}
                  onLoadMore={todayTodos.loadMore}
                  searchQuery={todayTodos.searchQuery}
                  onSearchChange={todayTodos.setSearchQuery}
                  priorityFilter={todayTodos.priorityFilter}
                  onPriorityFilterChange={todayTodos.setPriorityFilter}
                  statusFilter={todayTodos.statusFilter}
                  onStatusFilterChange={todayTodos.setStatusFilter}
                />
              </section>
              
              {/* Weekly Progress */}
              <section>
                <h2 className="text-2xl font-bold mb-4">{t('weeklyProgress', { defaultValue: 'Weekly Progress' })}</h2>
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium">{t('completionRate', { defaultValue: 'Completion Rate' })}</span>
                      </div>
                      <span className="font-bold">{stats.completionRate}%</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2 mb-6">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{t('taskDistribution', { defaultValue: 'Task Distribution' })}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-blue-500/20 rounded-md p-2 text-center">
                            <span className="text-xs text-blue-500">{t('work', { defaultValue: 'Work' })}</span>
                          </div>
                          <span className="text-sm mt-1">45%</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-green-500/20 rounded-md p-2 text-center">
                            <span className="text-xs text-green-500">{t('personal', { defaultValue: 'Personal' })}</span>
                          </div>
                          <span className="text-sm mt-1">30%</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-purple-500/20 rounded-md p-2 text-center">
                            <span className="text-xs text-purple-500">{t('other', { defaultValue: 'Other' })}</span>
                          </div>
                          <span className="text-sm mt-1">25%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
              
              {/* Upcoming Tasks */}
              <section>
                <h2 className="text-2xl font-bold mb-4">{t('upcomingTasks')}</h2>
                <DashboardTodoList
                  todos={upcomingTodos.items}
                  isLoading={upcomingTodos.isLoading}
                  error={upcomingTodos.error}
                  totalItems={upcomingTodos.totalItems}
                  emptyMessage={t('noUpcomingTasks', { defaultValue: 'No upcoming tasks scheduled' })}
                  viewAllLink="/todo"
                  viewAllLabel={t('viewAllTasks', { defaultValue: 'View All Tasks' })}
                  hasMore={upcomingTodos.hasMore}
                  onLoadMore={upcomingTodos.loadMore}
                  searchQuery={upcomingTodos.searchQuery}
                  onSearchChange={upcomingTodos.setSearchQuery}
                  priorityFilter={upcomingTodos.priorityFilter}
                  onPriorityFilterChange={upcomingTodos.setPriorityFilter}
                  statusFilter={upcomingTodos.statusFilter}
                  onStatusFilterChange={upcomingTodos.setStatusFilter}
                />
              </section>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            <div className="grid gap-6">
              <section>
                <h2 className="text-2xl font-bold mb-4">{t('allTasks', { defaultValue: 'All Tasks' })}</h2>
                <DashboardTodoList
                  todos={todayTodos.items.concat(upcomingTodos.items)}
                  isLoading={todayTodos.isLoading || upcomingTodos.isLoading}
                  error={todayTodos.error || upcomingTodos.error}
                  totalItems={todayTodos.totalItems + upcomingTodos.totalItems}
                  emptyMessage={t('noTasks', { defaultValue: 'No tasks available' })}
                  viewAllLink="/todo"
                  viewAllLabel={t('manageAllTasks', { defaultValue: 'Manage All Tasks' })}
                  hasMore={todayTodos.hasMore || upcomingTodos.hasMore}
                  onLoadMore={() => {
                    if (todayTodos.hasMore) todayTodos.loadMore();
                    if (upcomingTodos.hasMore) upcomingTodos.loadMore();
                  }}
                  searchQuery={todayTodos.searchQuery}
                  onSearchChange={todayTodos.setSearchQuery}
                  priorityFilter={todayTodos.priorityFilter}
                  onPriorityFilterChange={todayTodos.setPriorityFilter}
                  statusFilter={todayTodos.statusFilter}
                  onStatusFilterChange={todayTodos.setStatusFilter}
                />
              </section>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <section>
                <h2 className="text-2xl font-bold mb-4">{t('detailedAnalytics', { defaultValue: 'Detailed Analytics' })}</h2>
                <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t('productivityScore', { defaultValue: 'Productivity Score' })}</span>
                        </div>
                        <span className="font-bold text-lg">85/100</span>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">{t('taskCompletionTrend', { defaultValue: 'Task Completion Trend' })}</h3>
                        <div className="h-40 w-full bg-secondary/10 rounded-md flex items-end justify-between p-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center gap-1">
                              <div 
                                className="bg-primary w-8 rounded-t-sm" 
                                style={{ height: `${[60, 45, 80, 65, 90, 40, 75][i]}%` }}
                              ></div>
                              <span className="text-xs">{day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 