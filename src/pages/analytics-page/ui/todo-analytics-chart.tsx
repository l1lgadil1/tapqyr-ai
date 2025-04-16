import React from 'react';
import { TodoAnalytics } from '../../../shared/api/analytics-api';

interface TodoAnalyticsChartProps {
  todoAnalytics: TodoAnalytics | null;
  type: 'priority' | 'completion' | 'dueDate';
}

// Define the valid priority types
type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export function TodoAnalyticsChart({ todoAnalytics, type }: TodoAnalyticsChartProps) {
  if (!todoAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Colors for different priorities
  const priorityColors: Record<Priority, string> = {
    'HIGH': 'bg-red-500',
    'MEDIUM': 'bg-yellow-500',
    'LOW': 'bg-green-500',
    'NONE': 'bg-gray-300'
  };

  // Render pie chart for priority distribution
  if (type === 'priority') {
    const priorityDistribution = todoAnalytics.priorityDistribution || {};
    const priorities = Object.keys(priorityDistribution);
    
    // If there's no priority data
    if (priorities.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No priority data available</p>
        </div>
      );
    }

    // Calculate total for percentages
    const total = Object.values(priorityDistribution).reduce((sum, value) => sum + (value as number), 0);
    
    // Calculate pie chart segments
    let startAngle = 0;
    const segments = priorities.map(priority => {
      const value = priorityDistribution[priority] as number;
      const percentage = (value / total) * 100;
      const degrees = (percentage / 100) * 360;
      
      const segment = {
        priority,
        percentage,
        startAngle,
        endAngle: startAngle + degrees
      };
      
      startAngle += degrees;
      return segment;
    });

    return (
      <div className="flex flex-col items-center justify-center h-64">
        {/* Pie chart */}
        <div className="relative w-32 h-32 mb-4">
          {segments.map((segment, index) => {
            // Create a conic gradient segment
            const background = `conic-gradient(transparent ${segment.startAngle}deg, ${priorityColors[segment.priority as Priority] || 'bg-gray-300'} ${segment.startAngle}deg ${segment.endAngle}deg, transparent ${segment.endAngle}deg)`;
            
            return (
              <div
                key={index}
                className="absolute inset-0 rounded-full"
                style={{ 
                  background,
                  clipPath: 'circle(50%)'
                }}
              />
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 ${priorityColors[segment.priority as Priority] || 'bg-gray-300'} rounded-full mr-1`}></div>
              <span className="text-xs">{segment.priority}: {segment.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render completion chart
  if (type === 'completion') {
    return (
      <div className="flex flex-col justify-center h-64">
        {/* Completion rate */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs">Completion Rate</span>
            <span className="text-xs font-bold">{(todoAnalytics.completionRate * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary/30 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${todoAnalytics.completionRate * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Due date stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs">With Due Date</span>
            <span className="text-xs font-bold">
              {todoAnalytics.withDueDate} / {todoAnalytics.withDueDate + todoAnalytics.withoutDueDate}
            </span>
          </div>
          <div className="w-full bg-secondary/30 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ 
                width: `${(todoAnalytics.withDueDate / (todoAnalytics.withDueDate + todoAnalytics.withoutDueDate)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
        
        {/* AI Generated */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs">AI Generated</span>
            <span className="text-xs font-bold">
              {todoAnalytics.aiGeneratedCount} / {todoAnalytics.todoCount}
            </span>
          </div>
          <div className="w-full bg-secondary/30 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full" 
              style={{ width: `${todoAnalytics.aiGeneratedPercentage * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render due date chart
  if (type === 'dueDate') {
    const totalTodos = todoAnalytics.withDueDate + todoAnalytics.withoutDueDate;
    const withDueDatePercentage = totalTodos > 0 ? (todoAnalytics.withDueDate / totalTodos) * 100 : 0;
    const withoutDueDatePercentage = totalTodos > 0 ? (todoAnalytics.withoutDueDate / totalTodos) * 100 : 0;
    
    return (
      <div className="flex flex-col items-center justify-center h-64">
        {/* Pie chart for due date vs no due date */}
        <div className="relative w-32 h-32 mb-4">
          <div 
            className="absolute inset-0 rounded-full"
            style={{ 
              background: `conic-gradient(#3b82f6 0deg ${withDueDatePercentage * 3.6}deg, #cbd5e1 ${withDueDatePercentage * 3.6}deg 360deg)`,
              clipPath: 'circle(50%)'
            }}
          />
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <div className="flex flex-col">
              <span className="text-xs">With Due Date</span>
              <span className="text-xs font-bold">{withDueDatePercentage.toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-slate-300 rounded-full mr-1"></div>
            <div className="flex flex-col">
              <span className="text-xs">Without Due Date</span>
              <span className="text-xs font-bold">{withoutDueDatePercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {todoAnalytics.withDueDate} of {totalTodos} todos have due dates
          </p>
        </div>
      </div>
    );
  }
  
  return null;
} 