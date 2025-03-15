// This service connects to the backend OpenAI API
import { ActionButton } from '../ui/ai-action-buttons';
import { generateMockSuggestedActions } from './mock-data';
import { todoApi } from '../../../shared/api';
import type { Todo } from '../../../widgets/todo-list';

// Define the response types
interface AIResponse {
  completion: string;
}

interface TaskActionResponse {
  message: string;
  action: string;
  success: boolean;
  data?: Record<string, unknown>;
}

interface SuggestedActionsResponse {
  message: string;
  actions: ActionButton[];
}

/**
 * Get a response from the AI assistant
 * @param userMessage The user's message
 * @param languageCode Optional language code to specify response language
 * @returns The AI's response
 */
export async function getAIResponse(userMessage: string, languageCode?: string): Promise<string> {
  try {
    const response = await fetch('/api/openai/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: userMessage,
        ...(languageCode && { languageCode })
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.completion;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}

/**
 * Process a user action through the AI assistant
 * @param userMessage The user's message
 * @returns The result of the action
 */
export async function processAIAction(userMessage: string): Promise<TaskActionResponse> {
  try {
    // For development, parse the action from the message
    // In production, this would call the actual API endpoint
    const actionMatch = userMessage.match(/Perform action: ([a-z_]+)/);
    const action = actionMatch ? actionMatch[1] : 'unknown_action';
    
    // Extract data if available
    let data: Record<string, unknown> = {};
    const dataMatch = userMessage.match(/with data: ({.*?})(?: in the context|$)/);
    if (dataMatch) {
      try {
        data = JSON.parse(dataMatch[1]);
      } catch (e) {
        console.error('Error parsing action data:', e);
      }
    }
    
    // Process different action types
    switch (action) {
      case 'create_task':
        return await createTask(data);
      
      case 'create_multiple_tasks':
        return await createMultipleTasks(data, userMessage);
      
      case 'create_step_by_step_tasks':
        return await createStepByStepTasks(data, userMessage);
      
      case 'delete_task':
        return await deleteTask(data);
      
      case 'delete_completed_tasks':
        return await deleteCompletedTasks();
      
      case 'complete_task':
        return await completeTask(data);
      
      case 'complete_all_tasks':
        return await completeAllTasks();
      
      case 'list_tasks':
        return await listTasks();
      
      case 'list_completed_tasks':
        return await listCompletedTasks();
      
      case 'list_pending_tasks':
        return await listPendingTasks();
      
      case 'analyze_tasks':
        return await analyzeTasks();
      
      case 'generate_report':
        return await generateReport();
      
      case 'schedule_task':
        return await scheduleTask(data);
      
      case 'set_reminder':
        return await setReminder(data);
      
      case 'generate_guide':
        return await generateGuide(userMessage);
      
      default:
        return {
          message: `I'm not sure how to perform the action "${action}". Could you try a different action?`,
          action,
          success: false,
          data: { error: 'Unknown action type' }
        };
    }
  } catch (error) {
    console.error('Error processing AI action:', error);
    return {
      message: "I'm sorry, I encountered an error while processing your action. Please try again later.",
      action: 'error',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Mock implementation of task creation
async function createTask(data: Record<string, unknown>): Promise<TaskActionResponse> {
  // Validate required fields
  if (!data.title) {
    return {
      message: "I couldn't create the task because I need at least a title. Please provide more details.",
      action: 'create_task',
      success: false,
      data: { error: 'Missing title' }
    };
  }
  
  try {
    // Create the task using the todo API
    const newTodo = await todoApi.createTodo({
      title: data.title as string,
      description: data.description as string,
      priority: data.priority as 'low' | 'medium' | 'high' || 'medium',
      dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
      completed: false,
      isAIGenerated: true
    });
    
    return {
      message: `I've created a new task titled "${newTodo.title}" for you.`,
      action: 'create_task',
      success: true,
      data: {
        id: newTodo.id,
        title: newTodo.title,
        priority: newTodo.priority,
        dueDate: newTodo.dueDate,
        created: newTodo.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      message: "I'm sorry, I couldn't create the task due to a technical issue. Please try again later.",
      action: 'create_task',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation of multiple task creation
async function createMultipleTasks(data: Record<string, unknown>, context: string): Promise<TaskActionResponse> {
  // Extract task information from context if available
  const contextTitle = context.includes('multiple tasks') ? 
    context.split('multiple tasks').pop()?.trim() : null;
  const taskTitle = data.title as string || contextTitle || 'Task';
  
  try {
    // Create multiple tasks
    const tasks: Todo[] = [];
    const subtasks = [
      `${taskTitle} - Part 1`,
      `${taskTitle} - Part 2`,
      `${taskTitle} - Part 3`
    ];
    
    for (const subtask of subtasks) {
      const newTodo = await todoApi.createTodo({
        title: subtask,
        description: `Subtask for "${taskTitle}"`,
        priority: data.priority as 'low' | 'medium' | 'high' || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
        completed: false,
        isAIGenerated: true
      });
      tasks.push(newTodo);
    }
    
    return {
      message: `I've created ${tasks.length} tasks related to "${taskTitle}" for you.`,
      action: 'create_multiple_tasks',
      success: true,
      data: {
        taskCount: tasks.length,
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title
        }))
      }
    };
  } catch (error) {
    console.error('Error creating multiple tasks:', error);
    return {
      message: "I'm sorry, I couldn't create the tasks due to a technical issue. Please try again later.",
      action: 'create_multiple_tasks',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation of step-by-step task creation
async function createStepByStepTasks(data: Record<string, unknown>, context: string): Promise<TaskActionResponse> {
  // Extract the main goal from the context
  const goalMatch = context.match(/step by step (?:to |for |about )?(.*?)(?:with|by|before|$)/i) || 
                    context.match(/how to (.*?)(?:with|by|before|$)/i);
  
  const goal = goalMatch ? goalMatch[1].trim() : (data.title as string || 'Achieve your goal');
  
  try {
    // Generate steps for the goal
    const steps = [
      `Research about ${goal}`,
      `Create a plan for ${goal}`,
      `Execute first phase of ${goal}`,
      `Review progress on ${goal}`,
      `Complete ${goal}`
    ];
    
    // Create tasks for each step
    const tasks: Todo[] = [];
    for (let i = 0; i < steps.length; i++) {
      const newTodo = await todoApi.createTodo({
        title: steps[i],
        description: `Step ${i + 1} of ${steps.length} to ${goal}`,
        priority: data.priority as 'low' | 'medium' | 'high' || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
        completed: false,
        isAIGenerated: true
      });
      tasks.push(newTodo);
    }
    
    return {
      message: `I've created a step-by-step task list with ${tasks.length} steps to help you ${goal}.`,
      action: 'create_step_by_step_tasks',
      success: true,
      data: {
        goal,
        taskCount: tasks.length,
        tasks: tasks.map((task, index) => ({
          id: task.id,
          title: task.title,
          order: index + 1
        }))
      }
    };
  } catch (error) {
    console.error('Error creating step-by-step tasks:', error);
    return {
      message: "I'm sorry, I couldn't create the step-by-step tasks due to a technical issue. Please try again later.",
      action: 'create_step_by_step_tasks',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation for delete task
async function deleteTask(data: Record<string, unknown>): Promise<TaskActionResponse> {
  const taskId = data.id as string;
  
  if (!taskId) {
    return {
      message: "I couldn't delete the task because I need a task ID. Please specify which task you want to delete.",
      action: 'delete_task',
      success: false,
      data: { error: 'Missing task ID' }
    };
  }
  
  try {
    // Get the task details before deleting
    const task = await todoApi.getTodoById(taskId);
    const taskTitle = task.title;
    
    // Delete the task
    await todoApi.deleteTodo(taskId);
    
    return {
      message: `I've deleted the task "${taskTitle}" for you.`,
      action: 'delete_task',
      success: true,
      data: { 
        deleted: true,
        taskId,
        title: taskTitle
      }
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      message: "I'm sorry, I couldn't delete the task due to a technical issue. Please try again later.",
      action: 'delete_task',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation for delete completed tasks
async function deleteCompletedTasks(): Promise<TaskActionResponse> {
  try {
    // Get all tasks
    const allTasks = await todoApi.getAllTodos();
    
    // Filter completed tasks
    const completedTasks = allTasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
      return {
        message: "There are no completed tasks to delete.",
        action: 'delete_completed_tasks',
        success: true,
        data: { deletedCount: 0 }
      };
    }
    
    // Delete each completed task
    for (const task of completedTasks) {
      await todoApi.deleteTodo(task.id);
    }
    
    return {
      message: `I've deleted ${completedTasks.length} completed tasks.`,
      action: 'delete_completed_tasks',
      success: true,
      data: { deletedCount: completedTasks.length }
    };
  } catch (error) {
    console.error('Error deleting completed tasks:', error);
    return {
      message: "I'm sorry, I couldn't delete the completed tasks due to a technical issue. Please try again later.",
      action: 'delete_completed_tasks',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation for complete task
async function completeTask(data: Record<string, unknown>): Promise<TaskActionResponse> {
  const taskId = data.id as string;
  
  if (!taskId) {
    return {
      message: "I couldn't mark the task as completed because I need a task ID. Please specify which task you want to complete.",
      action: 'complete_task',
      success: false,
      data: { error: 'Missing task ID' }
    };
  }
  
  try {
    // Get the task details
    const task = await todoApi.getTodoById(taskId);
    
    if (task.completed) {
      return {
        message: `The task "${task.title}" is already marked as completed.`,
        action: 'complete_task',
        success: true,
        data: { 
          completed: true,
          taskId,
          title: task.title
        }
      };
    }
    
    // Toggle the task to completed
    const updatedTask = await todoApi.toggleTodoCompletion(taskId);
    
    return {
      message: `I've marked "${updatedTask.title}" as completed.`,
      action: 'complete_task',
      success: true,
      data: { 
        completed: true,
        taskId,
        title: updatedTask.title
      }
    };
  } catch (error) {
    console.error('Error completing task:', error);
    return {
      message: "I'm sorry, I couldn't mark the task as completed due to a technical issue. Please try again later.",
      action: 'complete_task',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation for complete all tasks
async function completeAllTasks(): Promise<TaskActionResponse> {
  try {
    // Get all tasks
    const allTasks = await todoApi.getAllTodos();
    
    // Filter incomplete tasks
    const incompleteTasks = allTasks.filter(task => !task.completed);
    
    if (incompleteTasks.length === 0) {
      return {
        message: "All tasks are already marked as completed.",
        action: 'complete_all_tasks',
        success: true,
        data: { completedCount: 0 }
      };
    }
    
    // Complete each task
    for (const task of incompleteTasks) {
      await todoApi.toggleTodoCompletion(task.id);
    }
    
    return {
      message: `I've marked all ${incompleteTasks.length} tasks as completed.`,
      action: 'complete_all_tasks',
      success: true,
      data: { completedCount: incompleteTasks.length }
    };
  } catch (error) {
    console.error('Error completing all tasks:', error);
    return {
      message: "I'm sorry, I couldn't mark all tasks as completed due to a technical issue. Please try again later.",
      action: 'complete_all_tasks',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation for list tasks
async function listTasks(): Promise<TaskActionResponse> {
  try {
    // Get all tasks
    const allTasks = await todoApi.getAllTodos();
    
    if (allTasks.length === 0) {
      return {
        message: "You don't have any tasks yet. Would you like me to help you create some?",
        action: 'list_tasks',
        success: true,
        data: { tasks: [] }
      };
    }
    
    return {
      message: `Here are your current tasks:`,
      action: 'list_tasks',
      success: true,
      data: {
        tasks: allTasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          priority: task.priority,
          dueDate: task.dueDate?.toISOString()
        }))
      }
    };
  } catch (error) {
    console.error('Error listing tasks:', error);
    return {
      message: "I'm sorry, I couldn't retrieve your tasks due to a technical issue. Please try again later.",
      action: 'list_tasks',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation for list completed tasks
async function listCompletedTasks(): Promise<TaskActionResponse> {
  try {
    // Get all tasks
    const allTasks = await todoApi.getAllTodos();
    
    // Filter completed tasks
    const completedTasks = allTasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
      return {
        message: "You don't have any completed tasks yet.",
        action: 'list_completed_tasks',
        success: true,
        data: { tasks: [] }
      };
    }
    
    return {
      message: `Here are your completed tasks:`,
      action: 'list_completed_tasks',
      success: true,
      data: {
        tasks: completedTasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          priority: task.priority,
          dueDate: task.dueDate?.toISOString()
        }))
      }
    };
  } catch (error) {
    console.error('Error listing completed tasks:', error);
    return {
      message: "I'm sorry, I couldn't retrieve your completed tasks due to a technical issue. Please try again later.",
      action: 'list_completed_tasks',
      success: false,
      data: { error: String(error) }
    };
  }
}

// Implementation for list pending tasks
async function listPendingTasks(): Promise<TaskActionResponse> {
  try {
    // Get all tasks
    const allTasks = await todoApi.getAllTodos();
    
    // Filter pending tasks
    const pendingTasks = allTasks.filter(task => !task.completed);
    
    if (pendingTasks.length === 0) {
      return {
        message: "You don't have any pending tasks. All tasks are completed!",
        action: 'list_pending_tasks',
        success: true,
        data: { tasks: [] }
      };
    }
    
    return {
      message: `Here are your pending tasks:`,
      action: 'list_pending_tasks',
      success: true,
      data: {
        tasks: pendingTasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          priority: task.priority,
          dueDate: task.dueDate?.toISOString()
        }))
      }
    };
  } catch (error) {
    console.error('Error listing pending tasks:', error);
    return {
      message: "I'm sorry, I couldn't retrieve your pending tasks due to a technical issue. Please try again later.",
      action: 'list_pending_tasks',
      success: false,
      data: { error: String(error) }
    };
  }
}

async function analyzeTasks(): Promise<TaskActionResponse> {
  return {
    message: "Here's an analysis of your tasks:",
    action: 'analyze_tasks',
    success: true,
    data: {
      totalTasks: 10,
      completedTasks: 4,
      pendingTasks: 6,
      highPriorityTasks: 3,
      upcomingDeadlines: 2
    }
  };
}

async function generateReport(): Promise<TaskActionResponse> {
  return {
    message: "I've generated a report of your task activity:",
    action: 'generate_report',
    success: true,
    data: {
      reportDate: new Date().toISOString(),
      completionRate: '40%',
      mostProductiveDay: 'Wednesday',
      averageCompletionTime: '2.3 days'
    }
  };
}

async function scheduleTask(data: Record<string, unknown>): Promise<TaskActionResponse> {
  if (!data.title) {
    return {
      message: "I couldn't schedule the task because I need at least a title. Please provide more details.",
      action: 'schedule_task',
      success: false,
      data: { error: 'Missing title' }
    };
  }
  
  return {
    message: `I've scheduled the task "${data.title}" for ${data.dueDate ? new Date(data.dueDate as string).toLocaleDateString() : 'tomorrow'}.`,
    action: 'schedule_task',
    success: true,
    data: {
      id: `task-${Date.now()}`,
      title: data.title,
      dueDate: data.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

async function setReminder(data: Record<string, unknown>): Promise<TaskActionResponse> {
  return {
    message: "I've set a reminder for you.",
    action: 'set_reminder',
    success: true,
    data: {
      reminderSet: true,
      reminderTime: data.reminderTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

async function generateGuide(context: string): Promise<TaskActionResponse> {
  // Extract the topic from the context
  const topicMatch = context.match(/guide (?:for |about )?(.*?)(?:with|by|before|$)/i) || 
                     context.match(/how to (.*?)(?:with|by|before|$)/i);
  
  const topic = topicMatch ? topicMatch[1].trim() : 'complete your task';
  
  return {
    message: `Here's a guide on how to ${topic}:`,
    action: 'generate_guide',
    success: true,
    data: {
      topic,
      steps: [
        { step: 1, description: `First, research about ${topic}` },
        { step: 2, description: `Next, create a plan for ${topic}` },
        { step: 3, description: `Then, execute your plan for ${topic}` },
        { step: 4, description: `Finally, review and improve your approach to ${topic}` }
      ]
    }
  };
}

/**
 * Generate tasks from a prompt
 * @param prompt The prompt to generate tasks from
 * @param languageCode Optional language code to specify response language
 * @returns The generated tasks
 */
export async function generateTasks(prompt: string, languageCode?: string): Promise<unknown[]> {
  try {
    const response = await fetch('/api/openai/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt,
        ...(languageCode && { languageCode })
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.tasks;
  } catch (error) {
    console.error('Error generating tasks:', error);
    return [];
  }
}

/**
 * Generate suggested actions based on a message
 * @param message The AI message to generate actions for
 * @param chatHistory Optional chat history for additional context
 * @returns The suggested actions response
 */
export async function generateSuggestedActions(message: string, chatHistory?: string): Promise<SuggestedActionsResponse> {
  try {
    // For development, use mock data instead of calling the API
    // In production, this would call the actual API endpoint
    const mockActions = generateMockSuggestedActions(message);
    
    // Ensure each action has the message context and chat history
    const actionsWithContext = mockActions.map(action => ({
      ...action,
      messageContext: action.messageContext || message,
      chatHistory: action.chatHistory || chatHistory
    }));
    
    return {
      message: "Here are some actions you might want to take:",
      actions: actionsWithContext
    };
    
    // Uncomment this code when the backend API is available
    /*
    const response = await fetch('/api/openai/suggested-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        chatHistory
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: SuggestedActionsResponse = await response.json();
    
    // Ensure each action has the message context and chat history
    const actionsWithContext = data.actions.map(action => ({
      ...action,
      messageContext: action.messageContext || message,
      chatHistory: action.chatHistory || chatHistory
    }));
    
    return {
      ...data,
      actions: actionsWithContext
    };
    */
  } catch (error) {
    console.error('Error generating suggested actions:', error);
    
    // Return default actions if there's an error
    return {
      message: "I'm sorry, I encountered an error while generating suggested actions. Here are some generic options:",
      actions: [
        {
          id: '1',
          label: 'Create Task',
          action: 'create_task',
          icon: 'create',
          messageContext: message,
          chatHistory: chatHistory
        },
        {
          id: '2',
          label: 'List Tasks',
          action: 'list_tasks',
          icon: 'list',
          messageContext: message,
          chatHistory: chatHistory
        }
      ]
    };
  }
} 