'use client';

import { useMemo } from 'react';
import { isToday, addDays } from 'date-fns';
import { TodoItem } from '../../../widgets/todo-list/types';

interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  activeTodos: number;
  completionRate: number;
  todayTodos: TodoItem[];
  upcomingTodos: TodoItem[];
  highPriorityTodos: TodoItem[];
  aiGeneratedTodos: TodoItem[];
}

/**
 * Custom hook to calculate todo statistics
 */
export function useTodoStats(todos: TodoItem[] | null | undefined, totalItems?: number): TodoStats {
  return useMemo(() => {
    // Ensure todos is an array
    const safeTodos = Array.isArray(todos) ? todos : [];
    
    const totalTodos = totalItems ?? safeTodos.length;
    const completedTodos = safeTodos.filter(todo => todo.completed).length;
    const activeTodos = totalTodos - completedTodos;
    
    // Calculate completion rate (avoid division by zero)
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    
    // Filter tasks due today
    const todayTodos = safeTodos.filter(todo => {
      if (!todo.dueDate) return false;
      return isToday(new Date(todo.dueDate));
    });
    
    // Filter upcoming tasks (due in the next 7 days)
    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);
    
    const upcomingTodos = safeTodos.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate > now && dueDate <= sevenDaysFromNow && !isToday(dueDate);
    });
    
    // Filter high priority tasks
    const highPriorityTodos = safeTodos.filter(todo => 
      todo.priority === 'high' && !todo.completed
    );
    
    // Filter AI generated tasks
    const aiGeneratedTodos = safeTodos.filter(todo => 
      todo.isAIGenerated === true
    );
    
    return {
      totalTodos,
      completedTodos,
      activeTodos,
      completionRate,
      todayTodos,
      upcomingTodos,
      highPriorityTodos,
      aiGeneratedTodos
    };
  }, [todos, totalItems]);
} 