import { ActionButton } from '../ui/ai-action-buttons';

/**
 * Generate mock suggested actions based on the AI message content
 * This is used for development/demo purposes when the backend API is not available
 * 
 * Note: Chat history will be added by the AI assistant component
 * 
 * @param message The AI message to generate actions for
 * @returns An array of suggested actions
 */
export function generateMockSuggestedActions(message: string): ActionButton[] {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Extract potential task details
  const taskTitle = extractTaskTitle(message) || 'New Task';
  const priority = extractPriority(message) || 'medium';
  const dueDate = extractDueDate(message);
  
  // Default actions that can be used for any message
  const defaultActions: ActionButton[] = [
    {
      id: '1',
      label: 'Create Task',
      action: 'create_task',
      icon: 'create',
      requiresConfirmation: true,
      messageContext: message,
      data: {
        title: taskTitle,
        priority: priority,
        ...(dueDate && { dueDate })
      }
      // Chat history will be added by the AI assistant component
    },
    {
      id: '2',
      label: 'List Tasks',
      action: 'list_tasks',
      icon: 'list',
      messageContext: message
      // Chat history will be added by the AI assistant component
    }
  ];
  
  // Task creation related actions
  if (lowerMessage.includes('create') || 
      lowerMessage.includes('add') || 
      lowerMessage.includes('new task') ||
      lowerMessage.includes('make a task')) {
    return [
      {
        id: '1',
        label: 'Create Task',
        action: 'create_task',
        icon: 'create',
        data: {
          title: taskTitle,
          priority: priority,
          ...(dueDate && { dueDate })
        },
        requiresConfirmation: true,
        messageContext: message
      },
      {
        id: '2',
        label: 'Create Multiple Tasks',
        action: 'create_multiple_tasks',
        icon: 'create',
        variant: 'secondary',
        requiresConfirmation: true,
        messageContext: message
      }
    ];
  }
  
  // Task deletion related actions
  if (lowerMessage.includes('delete') || 
      lowerMessage.includes('remove') || 
      lowerMessage.includes('clear')) {
    return [
      {
        id: '1',
        label: 'Delete Task',
        action: 'delete_task',
        icon: 'delete',
        variant: 'destructive',
        requiresConfirmation: true,
        messageContext: message
      },
      {
        id: '2',
        label: 'Delete Completed Tasks',
        action: 'delete_completed_tasks',
        icon: 'delete',
        variant: 'destructive',
        requiresConfirmation: true,
        messageContext: message
      }
    ];
  }
  
  // Task completion related actions
  if (lowerMessage.includes('complete') || 
      lowerMessage.includes('mark') || 
      lowerMessage.includes('finish')) {
    return [
      {
        id: '1',
        label: 'Mark as Completed',
        action: 'complete_task',
        icon: 'complete',
        variant: 'outline',
        requiresConfirmation: true,
        messageContext: message
      },
      {
        id: '2',
        label: 'Mark All as Completed',
        action: 'complete_all_tasks',
        icon: 'complete',
        variant: 'outline',
        requiresConfirmation: true,
        messageContext: message
      }
    ];
  }
  
  // Task analysis related actions
  if (lowerMessage.includes('analyze') || 
      lowerMessage.includes('statistics') || 
      lowerMessage.includes('progress') ||
      lowerMessage.includes('report')) {
    return [
      {
        id: '1',
        label: 'Analyze Tasks',
        action: 'analyze_tasks',
        icon: 'analyze',
        variant: 'secondary',
        messageContext: message
      },
      {
        id: '2',
        label: 'Generate Report',
        action: 'generate_report',
        icon: 'analyze',
        variant: 'secondary',
        requiresConfirmation: true,
        messageContext: message
      }
    ];
  }
  
  // Task scheduling related actions
  if (lowerMessage.includes('schedule') || 
      lowerMessage.includes('due date') || 
      lowerMessage.includes('deadline') ||
      lowerMessage.includes('remind')) {
    return [
      {
        id: '1',
        label: 'Schedule Task',
        action: 'schedule_task',
        icon: 'schedule',
        requiresConfirmation: true,
        messageContext: message,
        data: {
          title: taskTitle,
          dueDate: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default to tomorrow
        }
      },
      {
        id: '2',
        label: 'Set Reminder',
        action: 'set_reminder',
        icon: 'schedule',
        variant: 'secondary',
        requiresConfirmation: true,
        messageContext: message
      }
    ];
  }
  
  // Task listing related actions
  if (lowerMessage.includes('list') || 
      lowerMessage.includes('show') || 
      lowerMessage.includes('display') ||
      lowerMessage.includes('find') ||
      lowerMessage.includes('get')) {
    return [
      {
        id: '1',
        label: 'List All Tasks',
        action: 'list_tasks',
        icon: 'list',
        messageContext: message
      },
      {
        id: '2',
        label: 'Show Completed Tasks',
        action: 'list_completed_tasks',
        icon: 'list',
        variant: 'secondary',
        messageContext: message
      },
      {
        id: '3',
        label: 'Show Pending Tasks',
        action: 'list_pending_tasks',
        icon: 'list',
        variant: 'outline',
        messageContext: message
      }
    ];
  }
  
  // Step-by-step task creation
  if (lowerMessage.includes('step by step') || 
      lowerMessage.includes('steps') || 
      lowerMessage.includes('guide') ||
      lowerMessage.includes('how to')) {
    return [
      {
        id: '1',
        label: 'Create Step-by-Step Tasks',
        action: 'create_step_by_step_tasks',
        icon: 'create',
        requiresConfirmation: true,
        messageContext: message,
        data: {
          title: taskTitle,
          priority: priority
        }
      },
      {
        id: '2',
        label: 'Generate Guide',
        action: 'generate_guide',
        icon: 'analyze',
        variant: 'secondary',
        messageContext: message
      }
    ];
  }
  
  // Return default actions if no specific actions match
  return defaultActions;
}

/**
 * Extract a potential task title from a message
 * @param message The message to extract from
 * @returns The extracted title or null if none found
 */
function extractTaskTitle(message: string): string | null {
  // Try to extract text between quotes
  const quoteMatch = message.match(/"([^"]+)"|'([^']+)'/);
  if (quoteMatch) {
    return quoteMatch[1] || quoteMatch[2];
  }
  
  // Try to extract text after common phrases
  const phraseMatches = [
    /create (?:a )?task (?:to |for |about )?(.*?)(?:with|by|before|$)/i,
    /add (?:a )?task (?:to |for |about )?(.*?)(?:with|by|before|$)/i,
    /new task (?:to |for |about )?(.*?)(?:with|by|before|$)/i,
    /step by step (?:to |for |about )?(.*?)(?:with|by|before|$)/i,
    /how to (.*?)(?:with|by|before|$)/i,
  ];
  
  for (const regex of phraseMatches) {
    const match = message.match(regex);
    if (match && match[1] && match[1].trim().length > 0) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Extract priority from a message
 * @param message The message to extract from
 * @returns The extracted priority or null if none found
 */
function extractPriority(message: string): 'low' | 'medium' | 'high' | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('high priority') || 
      lowerMessage.includes('urgent') || 
      lowerMessage.includes('important')) {
    return 'high';
  }
  
  if (lowerMessage.includes('low priority') || 
      lowerMessage.includes('not urgent') || 
      lowerMessage.includes('minor')) {
    return 'low';
  }
  
  if (lowerMessage.includes('medium priority') || 
      lowerMessage.includes('moderate')) {
    return 'medium';
  }
  
  return null;
}

/**
 * Extract a due date from a message
 * @param message The message to extract from
 * @returns The extracted due date as ISO string or null if none found
 */
function extractDueDate(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  const now = new Date();
  
  // Check for common date phrases
  if (lowerMessage.includes('today')) {
    return now.toISOString();
  }
  
  if (lowerMessage.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  }
  
  if (lowerMessage.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString();
  }
  
  if (lowerMessage.includes('next month')) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString();
  }
  
  // Try to extract specific date patterns (this is a simple implementation)
  const dateRegex = /(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?/;
  const match = lowerMessage.match(dateRegex);
  
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
    const year = match[3] ? parseInt(match[3], 10) : now.getFullYear();
    
    // Handle 2-digit years
    const fullYear = year < 100 ? 2000 + year : year;
    
    const date = new Date(fullYear, month, day);
    
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  
  return null;
} 