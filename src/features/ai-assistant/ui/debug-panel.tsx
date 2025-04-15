import React from 'react';
import { useAssistantStore } from '../model/assistant-store';
import { Button } from '../../../shared/ui/button';

/**
 * Debug panel for testing AI assistant functionality during development
 * This should be disabled in production
 */
export const DebugPanel = () => {
  const { testCreateTask, sendMessage, isLoading } = useAssistantStore();
  
  if (process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }
  
  const handleRequestTaskCreation = () => {
    sendMessage("Please create a task to review project documentation by tomorrow with high priority");
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 p-2 rounded-md shadow-lg z-50 text-white">
      <div className="text-xs font-bold mb-2">AI Debug Panel</div>
      <div className="flex flex-col gap-2">
        <Button 
          onClick={testCreateTask} 
          size="sm" 
          className="bg-green-600 hover:bg-green-700 text-xs"
          disabled={isLoading}
        >
          Test Task Creation (Direct API)
        </Button>
        <Button 
          onClick={handleRequestTaskCreation} 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-xs"
          disabled={isLoading}
        >
          Test AI Task Creation
        </Button>
      </div>
    </div>
  );
}; 