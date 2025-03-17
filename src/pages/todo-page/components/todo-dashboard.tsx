'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '../../../shared/ui/card';
import { BarChart3, Calendar, CheckCircle2, Zap } from 'lucide-react';
import { useTranslation } from '../../../shared/lib/i18n';
import { Button } from '../../../shared/ui/button';
import { DashboardSkeleton } from '../../../shared/ui/skeleton';
import { CustomTooltip } from '../../../shared/ui/custom-tooltip';

interface TodoDashboardProps {
  totalTodos: number;
  completedTodos: number;
  activeTodos: number;
  completionRate: number;
  todayTodosCount: number;
  upcomingTodosCount: number;
  highPriorityTodosCount: number;
  isLoading: boolean;
  onAddTodoClick: () => void;
  onViewAllClick: () => void;
}

/**
 * Dashboard component for the Todo page
 */
export function TodoDashboard({
  totalTodos,
  completedTodos,
  activeTodos,
  completionRate,
  todayTodosCount,
  upcomingTodosCount,
  highPriorityTodosCount,
  isLoading,
  onAddTodoClick,
  onViewAllClick
}: TodoDashboardProps) {
  const { t } = useTranslation('todo');
  
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <motion.div variants={itemVariants}>
        <Card className="glass-panel border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t('stats.total')}</h3>
              <div className="p-2 rounded-full bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{totalTodos}</p>
                <p className="text-sm text-muted-foreground">{t('stats.tasksToday')}</p>
              </div>
              <CustomTooltip content={t('stats.clickToViewAll')}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onViewAllClick}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  {t('actions.viewAll', { ns: 'common' })}
                </Button>
              </CustomTooltip>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="glass-panel border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t('stats.completionRate')}</h3>
              <div className="p-2 rounded-full bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">
                  {completedTodos} / {totalTodos} {t('stats.completed')}
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeOpacity="0.1"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${completionRate}, 100`}
                    strokeLinecap="round"
                    className="text-primary"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="glass-panel border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t('stats.dueToday')}</h3>
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{todayTodosCount}</p>
                <p className="text-sm text-muted-foreground">
                  {upcomingTodosCount} {t('stats.upcomingDays')}
                </p>
              </div>
              <CustomTooltip content={t('stats.clickToViewToday')}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {}}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  {t('actions.viewToday', { ns: 'common' })}
                </Button>
              </CustomTooltip>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="glass-panel border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t('highPriority')}</h3>
              <div className="p-2 rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{highPriorityTodosCount}</p>
                <p className="text-sm text-muted-foreground">
                  {activeTodos - highPriorityTodosCount} {t('stats.requiresAttention')}
                </p>
              </div>
              <CustomTooltip content={t('stats.clickToViewHighPriority')}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onAddTodoClick}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  {t('actions.addNew')}
                </Button>
              </CustomTooltip>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 