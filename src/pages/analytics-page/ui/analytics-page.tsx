'use client';

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../../../shared/lib/i18n';
import { useAuth } from '../../../app/providers/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Tabs, TabsContent } from '../../../shared/ui/tabs/tabs';
import { NavigationTabs } from '../../../widgets/navigation-tabs/ui/navigation-tabs';
import { analyticsService } from '../../../shared/api';
import {
  TodoCompletionRate,
  UserComprehensiveAnalytics,
  getUserComprehensiveAnalytics
} from '../../../shared/api/analytics-api';
import { UserActivityChart } from './user-activity-chart';
import { BarChart3, GanttChartSquare, TrendingUp, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Skeleton } from '../../../shared/ui/skeleton';

/**
 * Analytics Page Component
 * Displays analytics data from the analytics service
 */
export function AnalyticsPage() {
  const { t } = useTranslation(['todo', 'common']);
  const { user } = useAuth();
  
  // State for API data
  const [userCompletionRates, setUserCompletionRates] = useState<TodoCompletionRate[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(user?.id || null);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch user completion rates - wrap in separate try/catch to handle backend errors
        try {
          const completionRates = await analyticsService.getTodoCompletionRates();
          setUserCompletionRates(completionRates);
          
          // If no user is selected yet and we have users, select the first one
          if (!selectedUserId && completionRates.length > 0) {
            setSelectedUserId(completionRates[0].userId);
          }
        } catch (completionError) {
          console.error('Error fetching user completion rates:', completionError);
          // Continue with empty completion rates
          setUserCompletionRates([]);
        }
        
        // If we have a selected user, fetch their comprehensive analytics
        if (selectedUserId) {
          try {
            const comprehensiveAnalytics = await getUserComprehensiveAnalytics(selectedUserId);
            setUserAnalytics(comprehensiveAnalytics);
          } catch (userError) {
            console.error(`Error fetching comprehensive analytics for user ${selectedUserId}:`, userError);
            setError(`Failed to load user analytics. Please try again later.`);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [selectedUserId]);
  
  // Handle user selection change
  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };
  
  // Skeleton component for loading state
  const LoadingSkeleton = () => (
    <div className="grid gap-6 animate-pulse">
      {/* Skeleton for Title and User Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Skeleton className="h-9 w-64 rounded" />
        <Skeleton className="h-10 w-full md:w-64 rounded" />
      </div>
      
      {/* Skeleton for Weekly Report */}
      <section>
        <Skeleton className="h-8 w-48 mb-4 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      </section>
      
      {/* Skeleton for Task Activity */}
      <section>
        <Skeleton className="h-8 w-56 mb-4 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
        {/* Skeleton for Activity By Day Chart */}
        <div className="mt-4">
           <Skeleton className="h-[420px] rounded-lg" /> 
        </div>
      </section>
      
      {/* Skeleton for User Activity */}
      <section>
        <Skeleton className="h-8 w-40 mb-4 rounded" />
        <Skeleton className="h-64 rounded-lg" />
      </section>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{t('analytics', { defaultValue: 'User Task Analytics' })} | Tapqyr</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs defaultValue="analytics" className="w-full">
          <NavigationTabs />
          
          <TabsContent value="analytics" className="mt-6">
            {error && (
              <div className="bg-destructive/20 text-destructive p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid gap-6">
                {/* Page Title and User Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h1 className="text-3xl font-bold">{t('userTaskAnalytics', { defaultValue: 'User Task Analytics' })}</h1>
                  
                  <div className="w-full md:w-64">
                    <Select 
                      value={selectedUserId || ''} 
                      onValueChange={handleUserChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectUser', { defaultValue: 'Select a user' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {userCompletionRates.map(userRate => (
                          <SelectItem key={userRate.userId} value={userRate.userId}>
                            {userRate.userName || userRate.userEmail || userRate.userId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Weekly Report Summary */}
                {selectedUserId && userAnalytics?.weeklyReport && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <CalendarCheck className="h-6 w-6 text-primary" />
                      {t('weeklyReport', { defaultValue: 'Weekly Report' })}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t('completedTasks', { defaultValue: 'Completed Tasks' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {userAnalytics.weeklyReport.completedTasks}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t('addedTasks', { defaultValue: 'Added Tasks' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {userAnalytics.weeklyReport.addedTasks}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t('upcomingTasks', { defaultValue: 'Upcoming Tasks' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {userAnalytics.weeklyReport.upcomingTasks}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t('overdueTasks', { defaultValue: 'Overdue Tasks' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-destructive">
                            {userAnalytics.weeklyReport.overdueTasks}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                )}
                
                {/* Task Activity */}
                {selectedUserId && userAnalytics?.taskAnalytics && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <GanttChartSquare className="h-6 w-6 text-primary" />
                      {t('userTaskActivity', { defaultValue: 'User Task Activity' })}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t('totalTasks', { defaultValue: 'Total Tasks' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {userAnalytics.taskAnalytics.todoCount}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t('completionRate', { defaultValue: 'Completion Rate' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {userAnalytics.taskAnalytics.completionRate
                              ? `${(userAnalytics.taskAnalytics.completionRate * 100).toFixed(1)}%`
                              : '0%'}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t('mostActiveDay', { defaultValue: 'Most Active Day' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {userAnalytics.taskAnalytics.mostActiveDay || t('notAvailable', { defaultValue: 'N/A' })}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t('withDueDate', { defaultValue: 'Tasks With Due Date' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {userAnalytics.taskAnalytics.dueDatePatterns?.withDueDate || 0}
                            <span className="text-sm ml-2 text-muted-foreground">
                              ({userAnalytics.taskAnalytics.todoCount ? 
                                `${((userAnalytics.taskAnalytics.dueDatePatterns?.withDueDate || 0) / userAnalytics.taskAnalytics.todoCount * 100).toFixed(1)}%` 
                                : '0%'})
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {userAnalytics.taskAnalytics.todosByDayOfWeek && Object.keys(userAnalytics.taskAnalytics.todosByDayOfWeek).length > 0 && (
                      <div className="mt-4">
                        <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                          <CardHeader>
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-primary" />
                              {t('activityByDay', { defaultValue: 'Activity By Day of Week' })}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <div className="grid grid-cols-7 h-full gap-2 items-end">
                                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                                  const count = userAnalytics.taskAnalytics.todosByDayOfWeek?.[day] || 0;
                                  const maxCount = Math.max(1, ...Object.values(userAnalytics.taskAnalytics.todosByDayOfWeek || {}).map(Number));
                                  const height = maxCount > 0 ? (count / maxCount * 100) : 0;
                                  const dayLabel = day.charAt(0) + day.slice(1).toLowerCase();

                                  return (
                                    <div key={day} className="flex flex-col items-center justify-end text-center">
                                      <div 
                                        className="w-full bg-primary/80 rounded-t-sm chart-bar" 
                                        style={{ height: `${height}%` }}
                                        data-tip={`${dayLabel}: ${count}`}
                                      ></div>
                                      <div className="mt-2 text-xs text-muted-foreground">
                                        {day.substring(0, 3)}
                                      </div>
                                      <div className="text-sm font-medium">
                                        {count}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </section>
                )}
                
                {/* User Activity */}
                {selectedUserId && userAnalytics?.engagementMetrics && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      {t('userActivity', { defaultValue: 'User Activity' })}
                    </h2>
                    
                    <Card className="border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">
                          {t('engagementMetrics', { defaultValue: 'Engagement Metrics' })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t('profileCompleteness', { defaultValue: 'Profile Completeness' })}
                            </p>
                            <div className="text-xl font-medium mt-1">
                              {(userAnalytics.engagementMetrics.profileCompleteness * 100).toFixed(0)}%
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t('totalTasks', { defaultValue: 'Total Tasks' })}
                            </p>
                            <div className="text-xl font-medium mt-1">
                              {userAnalytics.engagementMetrics.totalTodos}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t('accountAge', { defaultValue: 'Account Age' })}
                            </p>
                            <div className="text-xl font-medium mt-1">
                              {userAnalytics.engagementMetrics.daysSinceRegistration} {t('days', { defaultValue: 'days' })}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t('lastLogin', { defaultValue: 'Last Login' })}
                            </p>
                            <div className="text-xl font-medium mt-1">
                              {userAnalytics.engagementMetrics.lastLogin 
                                ? (new Date(userAnalytics.engagementMetrics.lastLogin).toString() !== 'Invalid Date' 
                                   ? format(new Date(userAnalytics.engagementMetrics.lastLogin), 'PP') 
                                   : t('unknown', { defaultValue: 'Unknown' }))
                                : t('never', { defaultValue: 'Never' })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <UserActivityChart userId={selectedUserId} />
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 