'use client';

import { forwardRef, useRef, useEffect } from 'react';
import { useAssistantStore, AssistantMessage } from '../model/assistant-store';
import { cn } from '../../../shared/lib/utils';
import { CircleAlert, Bot, User } from 'lucide-react';

interface MessageProps {
  message: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  };
}

const Message = ({ message }: MessageProps) => (
  <div 
    className={cn(
      "flex items-start gap-3 mb-4 max-w-[90%]",
      message.isUser ? "ml-auto flex-row-reverse" : ""
    )}
  >
    <div className={cn(
      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
      message.isUser ? "bg-primary" : "bg-secondary/50"
    )}>
      {message.isUser ? (
        <User className="h-4 w-4 text-primary-foreground" />
      ) : (
        <Bot className="h-4 w-4 text-foreground" />
      )}
    </div>
    
    <div>
      <div className={cn(
        "p-3 rounded-lg text-sm",
        message.isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-secondary/20 border border-border rounded-tl-none"
      )}>
        {message.content}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  </div>
);

const LoadingIndicator = ({ type }: { type: 'thinking' | 'generating' | 'analyzing' }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
      <Bot className="h-4 w-4 text-foreground" />
    </div>
    
    <div className="bg-secondary/20 p-3 rounded-lg border border-border rounded-tl-none">
      <div className="flex items-center gap-2">
        <div className="flex">
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce mx-1" style={{ animationDelay: '300ms' }} />
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
        </div>
        <span className="text-sm text-muted-foreground ml-1">
          {type === 'thinking' ? 'Thinking...' : 
           type === 'generating' ? 'Generating tasks...' : 
           'Analyzing productivity...'}
        </span>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ error, onDismiss }: { error: string; onDismiss: () => void }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
      <CircleAlert className="h-4 w-4 text-destructive" />
    </div>
    
    <div className="flex-1">
      <div className="bg-destructive/10 p-3 rounded-lg border border-destructive text-destructive text-sm rounded-tl-none">
        <p>Error: {error}</p>
        <button 
          onClick={onDismiss}
          className="text-xs mt-2 text-destructive hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
);

interface ChatMessagesProps {
  scrollToBottom: () => void;
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ scrollToBottom }, ref) => {
    const { 
      messages, 
      isLoading, 
      error, 
      isGeneratingTasks,
      isAnalyzing,
      clearError
    } = useAssistantStore();
    
    const bottomRef = useRef<HTMLDivElement>(null);
    
    // Convert the store messages to the component's message format
    const mapMessages = (messages: AssistantMessage[]) => {
      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.role === 'user',
        timestamp: msg.timestamp
      }));
    };
    
    // Auto-scroll to bottom on new messages
    useEffect(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      scrollToBottom();
    }, [messages, isLoading, error, scrollToBottom]);
    
    return (
      <div ref={ref} className="space-y-1 px-4">
        {mapMessages(messages).map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isLoading && <LoadingIndicator type="thinking" />}
        {isGeneratingTasks && <LoadingIndicator type="generating" />}
        {isAnalyzing && <LoadingIndicator type="analyzing" />}
        
        {error && <ErrorMessage error={error} onDismiss={clearError} />}
        
        <div ref={bottomRef} />
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages'; 