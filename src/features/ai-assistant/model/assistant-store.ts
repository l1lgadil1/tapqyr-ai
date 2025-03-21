import { create } from 'zustand';
import { 
  sendChatMessage, 
  createThread as createThreadApi, 
  generateTasks as generateTasksApi,
  analyzeProductivity as analyzeProductivityApi
} from '../api/assistant-api';

export interface AssistantMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface TaskSuggestion {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface ProductivityStats {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalTasks: number;
    completedTasks: number;
    incompleteTasks: number;
    overdueTasks: number;
    completionRate: string;
  };
  details: {
    completedByPriority: {
      high: number;
      medium: number;
      low: number;
    };
    avgCompletionTime: string;
  };
  recommendations: string[];
}

interface AssistantState {
  messages: AssistantMessage[];
  threadId: string | null;
  isLoading: boolean;
  error: string | null;
  productivityStats: ProductivityStats | null;
  taskSuggestions: TaskSuggestion[];
  isAnalyzing: boolean;
  isGeneratingTasks: boolean;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  createThread: () => Promise<string>;
  clearMessages: () => void;
  clearError: () => void;
  generateTasks: (prompt: string) => Promise<void>;
  analyzeProductivity: () => Promise<void>;
  clearProductivityStats: () => void;
  clearTaskSuggestions: () => void;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      content: 'Hello! I\'m your AI assistant. How can I help you with your tasks today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ],
  threadId: null,
  isLoading: false,
  error: null,
  productivityStats: null,
  taskSuggestions: [],
  isAnalyzing: false,
  isGeneratingTasks: false,
  
  sendMessage: async (message: string) => {
    // Don't allow empty messages
    if (!message.trim()) return;
    
    // Add user message to state
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      content: message,
      role: 'user',
      timestamp: new Date()
    };
    
    set(state => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null
    }));
    
    try {
      const { threadId } = get();
      
      // Send message to backend
      const response = await sendChatMessage(message, threadId || undefined);
      
      // Add assistant response to state
      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        content: response.message,
        role: 'assistant',
        timestamp: new Date()
      };
      
      set(state => ({
        messages: [...state.messages, assistantMessage],
        threadId: response.threadId,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },
  
  createThread: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Create a new thread
      const response = await createThreadApi();
      
      set({ 
        threadId: response.threadId,
        isLoading: false
      });
      
      return response.threadId;
    } catch (error) {
      console.error('Error creating thread:', error);
      
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create conversation thread'
      });
      
      throw error;
    }
  },
  
  generateTasks: async (prompt: string) => {
    try {
      set({ isGeneratingTasks: true, error: null });
      
      // First add a system message to the chat
      const userMessage: AssistantMessage = {
        id: `user-${Date.now()}`,
        content: `Please generate tasks based on: ${prompt}`,
        role: 'user',
        timestamp: new Date()
      };
      
      set(state => ({
        messages: [...state.messages, userMessage]
      }));
      
      // Call the API to generate tasks
      const response = await generateTasksApi(prompt);
      
      // Create assistant response
      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        content: response.message || `I've generated tasks based on your request: "${prompt}". You can find them in your task list.`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      set(state => ({
        messages: [...state.messages, assistantMessage],
        isGeneratingTasks: false
      }));
    } catch (error) {
      console.error('Error generating tasks:', error);
      
      set({
        isGeneratingTasks: false,
        error: error instanceof Error ? error.message : 'Failed to generate tasks'
      });
    }
  },
  
  analyzeProductivity: async () => {
    try {
      set({ isAnalyzing: true, error: null });
      
      // First add a system message to the chat
      const userMessage: AssistantMessage = {
        id: `user-${Date.now()}`,
        content: 'Please analyze my productivity.',
        role: 'user',
        timestamp: new Date()
      };
      
      set(state => ({
        messages: [...state.messages, userMessage]
      }));
      
      // Call the API to analyze productivity
      const response = await analyzeProductivityApi();
      
      // Create assistant response
      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        content: response.analysis,
        role: 'assistant',
        timestamp: new Date()
      };
      
      set(state => ({
        messages: [...state.messages, assistantMessage],
        isAnalyzing: false,
        // We might get detailed productivity stats in the future
        // productivityStats: response.productivityStats
      }));
    } catch (error) {
      console.error('Error analyzing productivity:', error);
      
      set({
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Failed to analyze productivity'
      });
    }
  },
  
  clearMessages: () => {
    set({
      messages: [
        {
          id: 'welcome',
          content: 'Hello! I\'m your AI assistant. How can I help you with your tasks today?',
          role: 'assistant',
          timestamp: new Date()
        }
      ],
      threadId: null
    });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  clearProductivityStats: () => {
    set({ productivityStats: null });
  },
  
  clearTaskSuggestions: () => {
    set({ taskSuggestions: [] });
  }
})); 