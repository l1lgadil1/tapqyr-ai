'use client';

import { Link } from 'react-router-dom';
import { useTranslation } from '../../../shared/lib/i18n';
import { TabsList, TabsTrigger } from '../../../shared/ui/tabs/tabs';
import { BarChart3, List } from 'lucide-react';

/**
 * Shared Navigation tabs component
 * Allows switching between main application views like todos and analytics
 * NOTE: The parent <Tabs> component must have its defaultValue set correctly
 */
export function NavigationTabs() {
  const { t } = useTranslation(['todo', 'common']);

  return (
    // Use a simpler base style, remove w-full for flexibility, let parent decide width
    <TabsList className="border-b rounded-none justify-start p-0 h-auto bg-transparent">
      <Link to="/todo">
        <TabsTrigger
          value="todos"
          // Rely solely on data-state for active styling
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 flex gap-2 items-center hover:bg-muted/50 transition-colors duration-200"
        >
          <List className="h-4 w-4" />
          {t('todos', { defaultValue: 'Todos' })}
        </TabsTrigger>
      </Link>

      <Link to="/analytics">
        <TabsTrigger
          value="analytics"
           // Rely solely on data-state for active styling
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 flex gap-2 items-center hover:bg-muted/50 transition-colors duration-200"
        >
          <BarChart3 className="h-4 w-4" />
          {t('analytics', { defaultValue: 'Analytics' })}
        </TabsTrigger>
      </Link>
      <Link to="/todo-dashboard">
        <TabsTrigger
          value="todo-dashboard"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 flex gap-2 items-center hover:bg-muted/50 transition-colors duration-200"
        >
          <BarChart3 className="h-4 w-4" />
          {t('todo-dashboard', { defaultValue: 'Todo Dashboard' })}
        </TabsTrigger>
      </Link>
    </TabsList>
  );
} 