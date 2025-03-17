'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Star, BrainCircuit } from 'lucide-react';
import { useTranslation } from '../../../shared/lib/i18n';
import { FilterBadge } from '../../../widgets/todo-list/ui/filter-badge';
import { FilterPriority, FilterStatus, TabValue } from '../types';

interface TodoFilterBadgesProps {
  activeTodos: number;
  completedTodos: number;
  highPriorityTodos: number;
  aiGeneratedTodos: number;
  filterStatus: FilterStatus;
  filterPriority: FilterPriority;
  aiFilter: boolean;
  setActiveTab: (tab: TabValue) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setFilterPriority: (priority: FilterPriority) => void;
  setAIFilter: (filter: boolean) => void;
}

/**
 * Filter badges component for the Todo page
 */
export function TodoFilterBadges({
  activeTodos,
  completedTodos,
  highPriorityTodos,
  aiGeneratedTodos,
  filterStatus,
  filterPriority,
  aiFilter,
  setActiveTab,
  setFilterStatus,
  setFilterPriority,
  setAIFilter
}: TodoFilterBadgesProps) {
  const { t } = useTranslation('todo');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-wrap justify-center gap-3 mb-6"
    >
      <FilterBadge
        icon={<Clock className="h-4 w-4 transition-transform group-hover:scale-110 duration-300" />}
        count={activeTodos}
        label={t('todoList.activeCount')}
        isActive={filterStatus === 'active' && filterPriority === 'all' && !aiFilter}
        onClick={() => {
          setActiveTab('all');
          setFilterStatus('active');
          setFilterPriority('all');
          setAIFilter(false);
        }}
        aria-label={`${t('status.active', { ns: 'common' })} ${activeTodos} ${t('todoList.activeCount')}`}
      />
      
      <FilterBadge
        icon={<CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110 duration-300" />}
        count={completedTodos}
        label={t('todoList.completedCount')}
        isActive={filterStatus === 'completed' && filterPriority === 'all' && !aiFilter}
        onClick={() => {
          setActiveTab('all');
          setFilterStatus('completed');
          setFilterPriority('all');
          setAIFilter(false);
        }}
        aria-label={`${t('status.completed', { ns: 'common' })} ${completedTodos} ${t('todoList.completedCount')}`}
      />
      
      <FilterBadge
        icon={<Star className="h-4 w-4 transition-transform group-hover:scale-110 duration-300" />}
        count={highPriorityTodos}
        label={t('todoList.highPriorityCount')}
        isActive={filterPriority === 'high' && filterStatus === 'all' && !aiFilter}
        onClick={() => {
          setActiveTab('all');
          setFilterPriority('high');
          setFilterStatus('all');
          setAIFilter(false);
        }}
        aria-label={`${t('priority.high', { ns: 'common' })} ${highPriorityTodos} ${t('todoList.highPriorityCount')}`}
      />
      
      <FilterBadge
        icon={<BrainCircuit className="h-4 w-4 transition-transform group-hover:scale-110 duration-300" />}
        count={aiGeneratedTodos}
        label={t('todoList.aiGeneratedCount')}
        isActive={aiFilter && filterStatus === 'all' && filterPriority === 'all'}
        onClick={() => {
          setActiveTab('all');
          setAIFilter(true);
          setFilterStatus('all');
          setFilterPriority('all');
        }}
        aria-label={`${t('ai.title')} ${aiGeneratedTodos} ${t('todoList.aiGeneratedCount')}`}
      />
    </motion.div>
  );
} 