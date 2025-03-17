'use client';

import { Link } from 'react-router-dom';
import { TabsList, TabsTrigger } from '../../../shared/ui/tabs/tabs';
import { useTranslation } from '../../../shared/lib/i18n';

type NavigationTabsProps = {
  activeTab: 'dashboard' | 'tasks';
};

/**
 * Navigation tabs component for main application navigation
 */
export function NavigationTabs({ activeTab }: NavigationTabsProps) {
  const { t } = useTranslation(['todo', 'common']);

  return (
    <TabsList className="grid grid-cols-2 w-full max-w-2xl mx-auto glass-panel border-primary/20 mb-6">
      <TabsTrigger value="dashboard" data-state={activeTab === 'dashboard' ? 'active' : ''} asChild>
        <Link to="/dashboard">{t('dashboard')}</Link>
      </TabsTrigger>
      <TabsTrigger value="tasks" data-state={activeTab === 'tasks' ? 'active' : ''} asChild>
        <Link to="/todo">{t('allTasks')}</Link>
      </TabsTrigger>
    </TabsList>
  );
} 