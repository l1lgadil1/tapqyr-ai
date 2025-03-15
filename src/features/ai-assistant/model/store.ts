import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isDesktop } from '../../../shared/lib/utils';
import { ActionButton } from '../ui/ai-action-buttons';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasAction?: boolean;
  actionResult?: ActionResult;
  suggestedActions?: ActionButton[];
}

export interface ActionResult {
  action: string;
  success: boolean;
  data?: Record<string, unknown>;
}

interface AIAssistantState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
  isLoading: boolean;
  
  // Actions
  setIsOpen: (isOpen: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (update: Partial<Message>) => void;
  clearMessages: () => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleOpen: () => void;
  toggleMinimize: () => void;
  setSuggestedActions: (messageId: string, actions: ActionButton[]) => void;
  clearSuggestedActions: (messageId: string) => void;
  getChatHistory: (maxMessages?: number) => string;
}

// Type for persisted state
type PersistedState = {
  messages?: Message[];
  isMinimized?: boolean;
};

// Default welcome message
const welcomeMessage: Message = {
  id: '1',
  content: "Hi there! I'm your AI assistant. How can I help you with your tasks today?",
  isUser: false,
  timestamp: new Date()
};

// Default initial state
const initialState = {
  isOpen: isDesktop(),
  isMinimized: false,
  messages: [welcomeMessage],
  isLoading: false,
};

export const useAIAssistantStore = create<AIAssistantState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsMinimized: (isMinimized) => set({ isMinimized }),
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date()
          }
        ]
      })),
      updateLastMessage: (update) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0) {
          const lastIndex = messages.length - 1;
          messages[lastIndex] = { ...messages[lastIndex], ...update };
        }
        return { messages };
      }),
      clearMessages: () => set({
        messages: [
          {
            ...welcomeMessage,
            timestamp: new Date()
          }
        ]
      }),
      setIsLoading: (isLoading) => set({ isLoading }),
      toggleOpen: () => set((state) => {
        const newIsOpen = !state.isOpen;
        // If we're opening the assistant, make sure it's not minimized
        return {
          isOpen: newIsOpen,
          isMinimized: newIsOpen ? false : state.isMinimized
        };
      }),
      toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
      setSuggestedActions: (messageId, actions) => set((state) => {
        const messages = state.messages.map(message => 
          message.id === messageId 
            ? { ...message, suggestedActions: actions } 
            : message
        );
        return { messages };
      }),
      clearSuggestedActions: (messageId) => set((state) => {
        const messages = state.messages.map(message => 
          message.id === messageId 
            ? { ...message, suggestedActions: undefined } 
            : message
        );
        return { messages };
      }),
      getChatHistory: (maxMessages = 10) => {
        const messages = get().messages;
        // Get the last N messages or all if less than N
        const recentMessages = messages.slice(-Math.min(maxMessages, messages.length));
        
        // Format the messages as a string
        return recentMessages.map(msg => {
          const role = msg.isUser ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        }).join('\n\n');
      }
    }),
    {
      name: 'ai-assistant-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages,
        isMinimized: state.isMinimized
      }),
      // This ensures the desktop state is respected on first load
      merge: (persistedState, currentState) => {
        // Use type assertion for the persisted state
        const typedPersistedState = persistedState as PersistedState;
        
        const merged = {
          ...currentState,
          ...typedPersistedState,
          // Always use the current isOpen state based on device type for first render
          isOpen: isDesktop()
        };
        return merged;
      }
    }
  )
); 