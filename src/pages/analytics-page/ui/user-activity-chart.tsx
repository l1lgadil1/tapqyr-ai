import React, { useEffect, useState } from 'react';
import { UserActivityPatterns } from '../../../shared/api/analytics-api';
import { analyticsService } from '../../../shared/api';

interface UserActivityChartProps {
  userId: string;
}

// Map numbers to day names
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function UserActivityChart({ userId }: UserActivityChartProps) {
  const [activityPatterns, setActivityPatterns] = useState<UserActivityPatterns | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchActivityPatterns = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const patterns = await analyticsService.getUserActivityPatterns(userId);
        setActivityPatterns(patterns);
        setError(null);
      } catch (err) {
        console.error('Error fetching user activity patterns:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivityPatterns();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!activityPatterns || !activityPatterns.todosByDayOfWeek) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No activity data available</p>
      </div>
    );
  }

  // Convert todosByDayOfWeek to the format we need
  const todosByDay = {} as Record<string, number>;
  
  // Ensure all days are present with at least a 0 value
  dayNames.forEach((day) => {
    todosByDay[day] = 0;
  });
  
  // Fill in the data from the API response
  // The API might return day numbers (0-6) or day names
  Object.entries(activityPatterns.todosByDayOfWeek).forEach(([key, value]) => {
    // If key is a number, convert to day name
    if (!isNaN(Number(key))) {
      const dayIndex = Number(key);
      todosByDay[dayNames[dayIndex]] = value as number;
    } else {
      // Key is already a day name
      todosByDay[key] = value as number;
    }
  });
  
  // Find max value for scaling
  const maxValue = Math.max(...Object.values(todosByDay));
  
  return (
    <div className="h-64 flex flex-col justify-center">
      <div className="grid grid-cols-7 gap-1 h-40">
        {dayNames.map((day, index) => {
          const value = todosByDay[day] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isHighest = value === maxValue && maxValue > 0;
          
          return (
            <div key={index} className="flex flex-col items-center justify-end">
              <div 
                className={`w-full data-bar relative ${isHighest ? 'animate-pulse-slow' : ''}`}
                style={{ height: `${percentage}%` }}
              >
                <div 
                  className={`absolute inset-0 ${isHighest ? 'bg-primary' : 'bg-primary/50'} rounded-t-md`}
                ></div>
              </div>
              <span className="text-xs mt-2">{day.substring(0, 3)}</span>
              <span className="text-xs font-bold">{value}</span>
            </div>
          );
        })}
      </div>

      {activityPatterns.mostActiveDay && (
        <div className="mt-4 text-center">
          <p className="text-sm">
            Most active day: <span className="font-bold">{activityPatterns.mostActiveDay}</span> 
            {activityPatterns.mostActiveDayCount && ` (${activityPatterns.mostActiveDayCount} todos)`}
          </p>
        </div>
      )}
    </div>
  );
} 