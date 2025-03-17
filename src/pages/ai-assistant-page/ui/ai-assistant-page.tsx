'use client';

import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../../shared/lib/i18n';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { ScrollArea } from '../../../shared/ui/scroll-area';
import { Card, CardContent } from '../../../shared/ui/card';
import { Tabs, TabsContent } from '../../../shared/ui/tabs/tabs';
import { cn } from '../../../shared/lib/utils';
import { NavigationTabs } from '../../dashboard-page/ui/navigation-tabs';

// Types for the AI assistant
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

/**
 * AI Assistant Page Component
 * Provides an interface for interacting with the AI assistant
 */
export function AIAssistantPage() {
  const { t } = useTranslation(['todo', 'common']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: t('welcomeMessage', { ns: 'todo', defaultValue: 'Hello! I\'m your AI assistant. How can I help you with your tasks today?' }),
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [t, messages.length]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to the chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // TODO: Implement actual API call to backend
      // This is a placeholder for the actual implementation
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: 'This is a placeholder response. The AI assistant feature is coming soon!',
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 400);
      
      // Actual implementation would look something like:
      /*
      const response = await fetch('/api/openai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          threadId: null,
        }),
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      */
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: t('errorMessage', { ns: 'common', defaultValue: 'Sorry, there was an error processing your request. Please try again.' }),
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{t('aiAssistant')} | Tapqyr</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="assistant" className="w-full">
          <NavigationTabs activeTab="assistant" />
          
          <TabsContent value="assistant" className="mt-0">
            <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex flex-col h-[70vh]">
                  {/* Chat messages area */}
                  <ScrollArea className="flex-1 p-4">
                    <AnimatePresence initial={false}>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "flex items-start gap-3 mb-4",
                            message.role === 'assistant' ? "justify-start" : "justify-end"
                          )}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bot size={18} className="text-primary" />
                            </div>
                          )}
                          
                          <div
                            className={cn(
                              "px-4 py-2 rounded-lg max-w-[80%]",
                              message.role === 'assistant' 
                                ? "bg-secondary/50 text-secondary-foreground" 
                                : "bg-primary text-primary-foreground ml-auto"
                            )}
                          >
                            {message.content}
                          </div>
                          
                          {message.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User size={18} className="text-primary" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 mb-4"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot size={18} className="text-primary" />
                          </div>
                          
                          <div className="px-4 py-2 rounded-lg bg-secondary/50 text-secondary-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </AnimatePresence>
                  </ScrollArea>
                  
                  {/* Input area */}
                  <div className="p-4 border-t border-border/50">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={t('typeMessage', { ns: 'common', defaultValue: 'Type your message...' })}
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!input.trim() || isLoading}
                        size="icon"
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 