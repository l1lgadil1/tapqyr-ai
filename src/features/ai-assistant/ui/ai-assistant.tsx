'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../shared/ui/button';
import { Textarea } from '../../../shared/ui/textarea';
import { 
  BrainCircuit, 
  X, 
  SendHorizonal, 
  Loader2, 
  Trash2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Plus,
  ListChecks
} from 'lucide-react';
import { cn, useIsDesktop, animations } from '../../../shared/lib/utils';
import { useAIAssistantStore } from '../model';
import { getAIResponse, processAIAction, generateSuggestedActions } from '../api';
import { AIMessage } from './ai-message';
import { ActionButton } from './ai-action-buttons';
// import { useTranslation } from '../../../shared/lib/i18n';

interface AIAssistantProps {
  className?: string;
}

// Language options for the selector
const languageOptions = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'ar', name: 'Arabic (العربية)' }
];

export function AIAssistant({ className }: AIAssistantProps) {
  // const { t } = useTranslation('common');
  const { 
    isOpen, 
    isMinimized, 
    messages, 
    isLoading, 
    toggleOpen, 
    toggleMinimize, 
    addMessage, 
    updateLastMessage,
    setIsLoading,
    clearMessages,
    setSuggestedActions,
    clearSuggestedActions
  } = useAIAssistantStore();
  
  const [input, setInput] = useState('');
  const isDesktop = useIsDesktop();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<string[]>([]);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when assistant is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);
  
  // Debounced function to check if the input appears to be an action
  const checkIfActionRequest = (text: string) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    setTypingTimeout(setTimeout(() => {
      const actionKeywords = ['create', 'add', 'delete', 'remove', 'update', 'complete', 'mark', 'generate'];
      const isActionRequest = actionKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      );
      
      setIsThinking(isActionRequest && text.length > 10);
    }, 500));
  };
  
  // Update the input handler to check for action requests
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    
    // Check if this might be an action request as the user types
    if (newValue.length > 5) {
      checkIfActionRequest(newValue);
    } else {
      setIsThinking(false);
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading || isPerformingAction) return;
    
    // Reset thinking state
    setIsThinking(false);
    
    // Check if this message is similar to a recent one to prevent duplicates
    const isDuplicate = pendingMessages.some(msg => 
      calculateSimilarity(msg, input.trim()) > 0.8
    );
    
    if (isDuplicate) {
      // Show a notification or feedback that this is a duplicate
      console.log('Duplicate message detected, but proceeding anyway');
    }
    
    // Add to pending messages to prevent duplicates
    setPendingMessages(prev => {
      const updated = [...prev, input.trim()];
      // Keep only the last 5 messages
      return updated.slice(-5);
    });
    
    // Store the user message for processing
    const userMessage = input.trim();
    
    // Add user message to the chat
    addMessage({
      content: userMessage,
      isUser: true
    });
    
    // Clear input field
    setInput('');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Check if the message appears to be an action request
      const actionKeywords = ['create', 'add', 'delete', 'remove', 'update', 'complete', 'mark', 'generate', 'list', 'show', 'find'];
      const isActionRequest = actionKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );
      
      // Get the chat history for context
      const chatHistory = useAIAssistantStore.getState().getChatHistory(10);
      
      // If it's an action request, suggest actions immediately
      if (isActionRequest) {
        // Generate suggested actions for the user message
        const suggestedActions = await generateSuggestedActions(userMessage, chatHistory);
        
        // Process as a regular message with language preference
        const aiResponse = await getAIResponse(userMessage,
          selectedLanguage !== 'auto' ? selectedLanguage : undefined);
        
        // Add AI response to the chat
        addMessage({
          content: aiResponse,
          isUser: false
        });
        
        // Get the last message ID to add suggested actions
        const currentMessages = useAIAssistantStore.getState().messages;
        const lastMessage = currentMessages[currentMessages.length - 1];
        
        // Add suggested actions to the last message
        if (lastMessage && !lastMessage.isUser && suggestedActions.actions.length > 0) {
          setSuggestedActions(lastMessage.id, suggestedActions.actions);
        }
      } else {
        // Process as a regular message with language preference
        const aiResponse = await getAIResponse(userMessage,
          selectedLanguage !== 'auto' ? selectedLanguage : undefined);
        
        // Add AI response to the chat
        addMessage({
          content: aiResponse,
          isUser: false
        });
        
        // Check if the AI response suggests an action
        const shouldSuggestActions = checkIfResponseSuggestsAction(aiResponse);
        if (shouldSuggestActions) {
          // Generate suggested actions after a short delay
          setTimeout(async () => {
            try {
              // Get the current messages from the store to ensure we have the latest state
              const currentMessages = useAIAssistantStore.getState().messages;
              const lastMessage = currentMessages[currentMessages.length - 1];
              
              // Get the chat history
              const chatHistory = useAIAssistantStore.getState().getChatHistory(10);
              
              if (lastMessage && !lastMessage.isUser) {
                const result = await generateSuggestedActions(aiResponse, chatHistory);
                if (result.actions.length > 0) {
                  setSuggestedActions(lastMessage.id, result.actions);
                }
              }
            } catch (error) {
              console.error('Error generating suggested actions:', error);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error in AI interaction:', error);
      
      // Add error message
      addMessage({
        content: "I'm sorry, I encountered an error. Please try again later.",
        isUser: false
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate text similarity (simple implementation)
  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  const handleClearMessages = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      clearMessages();
      setShowSettings(false);
    }
  };
  
  // Quick response suggestions
  const suggestions = [
    "Help me organize my tasks",
    "Create a shopping list",
    "How do I use this app?",
    "Generate tasks for a project"
  ];
  
  const handleSuggestionClick = (suggestion: string) => {
    addMessage({
      content: suggestion,
      isUser: true,
    });
    
    // Simulate typing delay
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const responseText = await getAIResponse(suggestion);
        
        addMessage({
          content: responseText,
          isUser: false,
        });
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        addMessage({
          content: "Sorry, I encountered an error. Please try again.",
          isUser: false,
        });
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };
  
  const handleActionClick = async (action: ActionButton) => {
    // Add a user message indicating the action was selected
    addMessage({
      content: `I want to ${action.label.toLowerCase()}`,
      isUser: true
    });
    
    // Set loading state
    setIsLoading(true);
    setIsPerformingAction(true);
    
    // Add a temporary AI response to show we're working on it
    addMessage({
      content: `I'm working on ${action.label.toLowerCase()} for you...`,
      isUser: false,
      hasAction: true
    });
    
    try {
      // Prepare the action prompt with context
      let actionPrompt = `Perform action: ${action.action}`;
      
      // Add data if available
      if (action.data && Object.keys(action.data).length > 0) {
        actionPrompt += ` with data: ${JSON.stringify(action.data)}`;
      }
      
      // Add message context if available
      if (action.messageContext) {
        actionPrompt += ` in the context of: "${action.messageContext}"`;
      }
      
      // Add chat history if available
      if (action.chatHistory) {
        actionPrompt += `\n\nHere is the recent conversation history for additional context:\n${action.chatHistory}`;
      }
      
      // Process the action
      const actionResult = await processAIAction(actionPrompt);
      
      // Update the last message with the action result
      updateLastMessage({
        content: actionResult.message,
        actionResult: {
          action: actionResult.action,
          success: actionResult.success,
          data: actionResult.data
        }
      });
    } catch (error) {
      console.error('Error processing action:', error);
      
      // Update the last message with an error
      updateLastMessage({
        content: "I'm sorry, I encountered an error while processing that action. Please try again later.",
        actionResult: {
          action: action.action,
          success: false,
          data: { error: 'Failed to process action' }
        }
      });
    } finally {
      setIsLoading(false);
      setIsPerformingAction(false);
    }
  };
  
  const handleSuggestedActionsGenerated = (messageId: string, actions: ActionButton[]) => {
    setSuggestedActions(messageId, actions);
  };
  
  const handleSuggestedActionsDismissed = (messageId: string) => {
    clearSuggestedActions(messageId);
  };
  
  // Check if the AI response suggests an action
  const checkIfResponseSuggestsAction = (response: string): boolean => {
    const lowerResponse = response.toLowerCase();
    
    // Check for phrases that suggest an action
    const actionPhrases = [
      'would you like me to',
      'i can help you',
      'do you want me to',
      'should i',
      'i could',
      'would you like to',
      'i can create',
      'i can delete',
      'i can update',
      'i can mark',
      'i can generate',
      'i can analyze',
      'i can schedule'
    ];
    
    return actionPhrases.some(phrase => lowerResponse.includes(phrase));
  };
  
  // Settings panel content
  const renderSettingsPanel = () => (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium">Settings</h3>
      
      <div className="space-y-2">
        <label htmlFor="language-select" className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Language
        </label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Select a language or use auto-detect for the AI assistant to respond in your preferred language.
        </p>
      </div>
      
      <div className="pt-2">
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full" 
          onClick={handleClearMessages}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Conversation
        </Button>
      </div>
    </div>
  );
  
  // Replace the existing messages rendering with our new AIMessage component
  const renderMessages = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <AIMessage
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
            onActionClick={handleActionClick}
            onSuggestedActionsGenerated={handleSuggestedActionsGenerated}
            onSuggestedActionsDismissed={handleSuggestedActionsDismissed}
          />
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
  
  return (
    <>
      {/* Toggle button - only visible on mobile or when assistant is closed */}
      {(!isDesktop || !isOpen) && (
        <motion.div {...animations.scale}>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "fixed left-4 bottom-4 z-50 rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:bg-primary/10",
              isOpen && "bg-primary/10"
            )}
            onClick={toggleOpen}
            aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <BrainCircuit className="h-5 w-5" />}
          </Button>
        </motion.div>
      )}
      
      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isDesktop ? { opacity: 0 } : { x: -320, opacity: 0 }}
            animate={isDesktop 
              ? { opacity: 1, width: isMinimized ? 60 : 320 }
              : { x: 0, opacity: 1, width: isMinimized ? 60 : 320 }
            }
            exit={isDesktop ? { opacity: 0 } : { x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-40 shadow-lg border-r border-primary/20 bg-background/95 backdrop-blur-md",
              isDesktop 
                ? isMinimized 
                  ? "left-0 top-[64px] bottom-0 h-[calc(100vh-64px)] w-[60px] border-r" 
                  : "left-0 top-[64px] bottom-0 h-[calc(100vh-64px)] w-[320px] border-r"
                : isMinimized 
                  ? "left-4 bottom-20 h-[400px] w-[60px] rounded-lg border" 
                  : "left-4 bottom-20 h-[500px] w-[320px] rounded-lg border",
              className
            )}
          >
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between p-3 border-b border-primary/10 bg-background/50"
              {...animations.fadeIn}
            >
              {!isMinimized && (
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">AI Assistant</h3>
                </div>
              )}
              
              <div className="flex items-center">
                {!isMinimized && isDesktop && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 mr-1"
                    onClick={() => setShowSettings(!showSettings)}
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                
                {isDesktop && !isMinimized && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 mr-1"
                    onClick={toggleOpen}
                    aria-label="Close AI Assistant"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                  onClick={toggleMinimize}
                  aria-label={isMinimized ? "Expand AI Assistant" : "Minimize AI Assistant"}
                >
                  {isMinimized ? 
                    <PanelLeftOpen className="h-4 w-4" /> : 
                    <PanelLeftClose className="h-4 w-4" />
                  }
                </Button>
              </div>
            </motion.div>
            
            {/* Content */}
            {!isMinimized && (
              <div className="flex flex-col h-[calc(100%-64px)]">
                {/* Settings panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-b border-primary/10 overflow-hidden"
                    >
                      {renderSettingsPanel()}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Messages */}
                {renderMessages()}
                
                {/* Quick suggestions */}
                {messages.length < 3 && (
                  <motion.div 
                    className="p-3 border-t border-primary/10 bg-background/50"
                    {...animations.slideInFromBottom}
                  >
                    <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.div
                          key={suggestion}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs py-1 h-auto bg-background/50 hover:bg-primary/5"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t">
                  <div className="relative">
                    {isThinking && !isLoading && (
                      <div className="absolute -top-6 left-0 right-0 text-center">
                        <span className="text-xs bg-muted px-2 py-1 rounded-md animate-pulse">
                          Thinking about how to help with this...
                        </span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="min-h-[40px] resize-none"
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={isLoading || !input.trim()}
                        className={cn(
                          "shrink-0",
                          isLoading && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SendHorizonal className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => handleSuggestionClick("Create a new task for me")}
                      >
                        Create task
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => handleSuggestionClick("List my tasks")}
                      >
                        List tasks
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => handleSuggestionClick("Generate tasks for a project")}
                      >
                        Generate tasks
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Minimized view */}
            {isMinimized && (
              <motion.div 
                className="flex flex-col items-center justify-between h-[calc(100%-64px)] py-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-primary/10 relative"
                      onClick={toggleMinimize}
                      aria-label="Expand AI Assistant"
                    >
                      <PanelLeftOpen className="h-5 w-5 text-primary" />
                      {messages.length > 0 && messages[messages.length - 1].isUser === false && (
                        <motion.span 
                          className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 15 
                          }}
                        />
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-primary/10"
                      onClick={toggleOpen}
                      aria-label="Close AI Assistant"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-primary/5 hover:bg-primary/10"
                      onClick={() => {
                        toggleMinimize();
                        setTimeout(() => {
                          inputRef.current?.focus();
                          setInput("Create a new task");
                        }, 300);
                      }}
                      aria-label="Quick create task"
                    >
                      <Plus className="h-5 w-5 text-primary" />
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-primary/5 hover:bg-primary/10"
                      onClick={() => {
                        toggleMinimize();
                        setTimeout(() => {
                          inputRef.current?.focus();
                          setInput("List my tasks");
                        }, 300);
                      }}
                      aria-label="Quick list tasks"
                    >
                      <ListChecks className="h-5 w-5 text-primary" />
                    </Button>
                  </motion.div>
                </div>
                
                {/* Visual indicator for AI status */}
                <div className="mt-2 flex flex-col items-center">
                  {isLoading ? (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5 
                      }}
                      className="h-3 w-3 bg-primary rounded-full"
                    />
                  ) : (
                    <div className="h-3 w-3 bg-green-500 rounded-full" />
                  )}
                  <span className="text-xs text-muted-foreground mt-1">
                    {isLoading ? "Thinking..." : "Ready"}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 