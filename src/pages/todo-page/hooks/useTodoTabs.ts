'use client';

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TabValue } from '../types';

interface UseTodoTabsReturn {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
  isRedirecting: boolean;
  redirectToAllTasks: () => void;
}

/**
 * Custom hook to manage the todo tabs state
 */
export function useTodoTabs(): UseTodoTabsReturn {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabValue) || 'dashboard';
  
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Helper function to redirect to all tasks tab with animation
  const redirectToAllTasks = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      setActiveTab('all');
      setIsRedirecting(false);
    }, 300);
  };

  return {
    activeTab,
    setActiveTab,
    isRedirecting,
    redirectToAllTasks
  };
} 