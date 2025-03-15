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
  Settings
} from 'lucide-react';
import { cn, useIsDesktop, animations } from '../../../shared/lib/utils';
import { useAIAssistantStore } from '../model';
import { getAIResponse, processAIAction } from '../api';
import { AIMessage } from './ai-message';
import { ActionButton } from './ai-action-buttons';
// import { useTranslation } from '../../../shared/lib/i18n';

export function AIAssistant() {
  // const { t } = useTranslation('common');
  const { 
    isOpen, 
    messages, 
    isLoading, 
    toggleOpen, 
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when assistant is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Check if this might be an action request
    checkIfActionRequest(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    addMessage({
      content: input,
      isUser: true
    });
    
    // Clear input
    setInput('');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Get chat history for context
      const chatHistory = useAIAssistantStore.getState().getChatHistory(10);
      
      // Get AI response
      const response = await getAIResponse(input, chatHistory);
      
      // Add AI message
      addMessage({
        content: response,
        isUser: false
      });
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      addMessage({
        content: "I'm sorry, I encountered an error. Please try again later.",
        isUser: false
      });
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };
  
  const handleActionClick = async (action: ActionButton) => {
    // Add a user message indicating the action was selected
    addMessage({
      content: `I want to ${action.label.toLowerCase()}`,
      isUser: true
    });
    
    // Set loading state
    setIsLoading(true);
    
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
    }
  };
  
  const handleSuggestedActionsGenerated = (messageId: string, actions: ActionButton[]) => {
    setSuggestedActions(messageId, actions);
  };
  
  const handleSuggestedActionsDismissed = (messageId: string) => {
    clearSuggestedActions(messageId);
  };
  
  // Sample suggestions for new users
  const suggestions = [
    "Create a task for me",
    "What tasks do I have today?",
    "Help me organize my tasks",
    "Generate a project plan",
    "Remind me about my deadlines"
  ];
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };
  
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
  
  // Render settings panel
  const renderSettingsPanel = () => {
    return (
      <div className="p-3 space-y-3">
        <div>
          <label className="text-xs font-medium mb-1 block">Language</label>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-2 text-sm rounded-md border border-input bg-background"
          >
            {languageOptions.map(option => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-start"
            onClick={clearMessages}
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Clear conversation
          </Button>
        </div>
      </div>
    );
  };
  
  // Render messages
  const renderMessages = () => {
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
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
  };
  
  return (
    <>
      {/* Toggle button - always visible when assistant is closed */}
      {!isOpen && (
        <motion.div {...animations.scale} className="fixed left-4 bottom-4 z-50">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:bg-primary/10"
            onClick={toggleOpen}
            aria-label="Open AI Assistant"
          >
            <BrainCircuit className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
      
      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isDesktop ? { opacity: 0, x: -20 } : { opacity: 0, y: 20 }}
            animate={isDesktop ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            exit={isDesktop ? { opacity: 0, x: -20 } : { opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 shadow-lg border bg-background/95 backdrop-blur-md",
              isDesktop 
                ? "left-4 bottom-4 h-[calc(100vh-8rem)] max-h-[600px] w-[350px] rounded-lg"
                : "inset-2 rounded-lg"
            )}
            style={{ 
              pointerEvents: 'auto',
              touchAction: 'auto'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-primary/10 bg-background/50">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-primary/10 mr-1"
                  onClick={() => setShowSettings(!showSettings)}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                  onClick={toggleOpen}
                  aria-label="Close AI Assistant"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
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
              <form onSubmit={handleSubmit} className="p-3 border-t mt-auto">
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 