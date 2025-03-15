import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  messages: Message[];
  isLoading: boolean;
  
  // Actions
  setIsOpen: (isOpen: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (update: Partial<Message>) => void;
  clearMessages: () => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleOpen: () => void;
  setSuggestedActions: (messageId: string, actions: ActionButton[]) => void;
  clearSuggestedActions: (messageId: string) => void;
  getChatHistory: (maxMessages?: number) => string;
}

// Type for persisted state
type PersistedState = {
  messages?: Message[];
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
  isOpen: false,
  messages: [welcomeMessage],
  isLoading: false,
};

export const useAIAssistantStore = create<AIAssistantState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setIsOpen: (isOpen) => set({ isOpen }),
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
      toggleOpen: () => set((state) => ({
        isOpen: !state.isOpen
      })),
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
        const recentMessages = messages.slice(-maxMessages);
        
        return recentMessages.map(msg => 
          `${msg.isUser ? 'User' : 'AI'}: ${msg.content}`
        ).join('\n');
      }
    }),
    {
      name: 'ai-assistant-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages,
      } as PersistedState),
    }
  )
); 