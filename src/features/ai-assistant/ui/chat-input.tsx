'use client';

import { useState, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Loader2, Unlock } from 'lucide-react';
import { Button } from '../../../shared/ui/button';
import { useAssistantStore } from '../model/assistant-store';
import { Textarea } from '../../../shared/ui/textarea/ui/textarea';
import { setToken } from '../../../shared/api/core/token-storage';
import { toast } from '../../../shared/ui/use-toast';

interface ChatInputProps {
  onMessageSent?: () => void;
}

export function ChatInput({ onMessageSent }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, isLoading, isGeneratingTasks, isAnalyzing, fetchPendingCalls } = useAssistantStore();
  
  const isDisabled = isLoading || isGeneratingTasks || isAnalyzing;
  
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without Shift key for newline)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isDisabled) return;
    
    const message = inputValue.trim();
    setInputValue('');
    
    await sendMessage(message);
    
    if (onMessageSent) {
      onMessageSent();
    }
    
    // Fetch pending calls after sending a message
    setTimeout(() => {
      fetchPendingCalls();
    }, 1000);
  };

  // Debug function to simulate login for testing
  const handleDebugLogin = () => {
    // Set a testing token - this is just for debugging
    const debugToken = 'debug-token-' + Date.now();
    setToken(debugToken);
    toast({
      title: 'Debug Login',
      description: 'Test token set for debugging',
    });
  };
  
  return (
    <div className="p-4 border-t border-border">
      <div className="flex gap-2">
        <Textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[60px] resize-none flex-1 p-2"
          disabled={isDisabled}
          rows={1}
        />
        <Button 
          size="icon" 
          className="shrink-0 self-end"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isDisabled}
        >
          {isDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        {/* Debug login button - REMOVE IN PRODUCTION */}
        <Button
          size="icon"
          variant="outline"
          className="shrink-0 self-end"
          onClick={handleDebugLogin}
          title="Debug login (testing only)"
        >
          <Unlock className="h-4 w-4" />
        </Button>
      </div>
      {isDisabled && (
        <p className="text-xs text-muted-foreground mt-2">
          {isLoading ? 'Assistant is thinking...' : 
           isGeneratingTasks ? 'Generating tasks...' : 
           'Analyzing productivity...'}
        </p>
      )}
    </div>
  );
} 