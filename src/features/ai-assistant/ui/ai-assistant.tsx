import { useState, useRef, useEffect } from 'react';
import { Bot, X, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '../../../shared/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../../../shared/ui/dialog';
import { ScrollArea } from '../../../shared/ui/scroll-area';
import { cn } from '../../../shared/lib/utils';
import { useAssistantStore, AssistantMessage } from '../model/assistant-store';
import { PendingCalls } from './pending-calls';

// Width configuration
const COLLAPSED_WIDTH = 60; // Keep collapsed width fixed in pixels
const DEFAULT_WIDTH_PERCENTAGE = 25; // Default width as percentage of screen
const MIN_WIDTH_PIXELS = 280; // Minimum width in pixels
const MAX_WIDTH_PIXELS = 500; // Maximum width in pixels

// Custom event for width changes
const RESIZE_EVENT_NAME = 'aiAssistantResize';
const dispatchResizeEvent = (width: number) => {
  const event = new CustomEvent(RESIZE_EVENT_NAME, { detail: { width } });
  window.dispatchEvent(event);
};

interface AiAssistantContentProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  variant: 'desktop' | 'mobile';
}

/**
 * Shared AI Assistant content component used by both desktop and mobile versions
 */
const AiAssistantContent = ({ 
  isCollapsed = false, 
  onToggleCollapse, 
  onClose,
  variant 
}: AiAssistantContentProps) => {
  const { 
    messages, 
    isLoading, 
    error, 
    isGeneratingTasks,
    isAnalyzing,
    sendMessage,
    clearError 
  } = useAssistantStore();
  
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };
  
  // Convert the store messages to the component's message format
  const mapMessages = (messages: AssistantMessage[]) => {
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.role === 'user',
      timestamp: msg.timestamp
    }));
  };

  // Header component with responsive handling
  const Header = () => (
    <div className="flex items-center justify-between p-4 border-b border-border">
      {!isCollapsed && (
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Tapqyr AI</h2>
        </div>
      )}
      {isCollapsed && (
        <Bot className="h-5 w-5 text-primary mx-auto" />
      )}

      {variant === 'desktop' && (
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("ml-auto", isCollapsed && "mx-auto")}
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
      
      {variant === 'mobile' && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  // If collapsed, just show the header
  if (variant === 'desktop' && isCollapsed) {
    return <Header />;
  }

  return (
    <div 
      className={cn(
        "flex flex-col h-full",
        isCollapsed && "items-center"
      )}
    >
      <Header />
      
      {!isCollapsed && (
        <>
          <PendingCalls onUpdate={() => scrollAreaRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })} />
          
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 px-3 pt-1"
            type="auto"
          >
            {/* Messages container */}
            <div className="space-y-4 mb-4">
              {mapMessages(messages).map((message) => (
                <div 
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg max-w-[85%]",
                    message.isUser 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-muted border border-border"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}

              {(isLoading || isGeneratingTasks || isAnalyzing) && (
                <div className="p-3 rounded-lg max-w-[85%] bg-muted border border-border">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-primary/60 rounded-full animate-pulse" />
                    <div className="h-3 w-3 bg-primary/60 rounded-full animate-pulse delay-150" />
                    <div className="h-3 w-3 bg-primary/60 rounded-full animate-pulse delay-300" />
                    <span className="text-sm text-muted-foreground">
                      {isLoading ? 'Thinking...' : 
                       isGeneratingTasks ? 'Generating tasks...' : 
                       'Analyzing productivity...'}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg max-w-[85%] bg-destructive/10 border border-destructive text-destructive text-sm">
                  <p>Error: {error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearError}
                    className="mt-2 h-7 text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
      
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || isGeneratingTasks || isAnalyzing}
          />
          <Button 
            size="icon" 
            className="shrink-0"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || isGeneratingTasks || isAnalyzing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Desktop variant of the AI Assistant
 */
export const AiAssistant = ({ className }: { className?: string }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage for collapsed state
    const savedState = localStorage.getItem('aiAssistant.collapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate width based on screen size
  const getWidthInPixels = () => {
    if (isCollapsed) return COLLAPSED_WIDTH;
    const screenWidth = window.innerWidth;
    const percentWidth = Math.round(screenWidth * (DEFAULT_WIDTH_PERCENTAGE / 100));
    
    // Constrain between min and max
    return Math.min(Math.max(percentWidth, MIN_WIDTH_PIXELS), MAX_WIDTH_PIXELS);
  };

  // Save collapsed state to localStorage and notify
  useEffect(() => {
    localStorage.setItem('aiAssistant.collapsed', JSON.stringify(isCollapsed));
    
    // Dispatch custom event with current width
    dispatchResizeEvent(isCollapsed ? COLLAPSED_WIDTH : getWidthInPixels());
  }, [isCollapsed]);

  // Apply width directly to the container element
  useEffect(() => {
    if (containerRef.current) {
      if (isCollapsed) {
        containerRef.current.style.width = `${COLLAPSED_WIDTH}px`;
      } else {
        containerRef.current.style.width = `${DEFAULT_WIDTH_PERCENTAGE}%`;
        
        // Ensure min/max constraints
        const currentWidth = getWidthInPixels();
        if (currentWidth === MIN_WIDTH_PIXELS || currentWidth === MAX_WIDTH_PIXELS) {
          containerRef.current.style.width = `${currentWidth}px`;
        }
      }
    }
  }, [isCollapsed]);
  
  // Update width on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isCollapsed && containerRef.current) {
        // Calculate constrained width
        const currentWidth = getWidthInPixels();
        
        // If at min/max constraints, use pixels
        if (currentWidth === MIN_WIDTH_PIXELS || currentWidth === MAX_WIDTH_PIXELS) {
          containerRef.current.style.width = `${currentWidth}px`;
        } else {
          // Otherwise use percentage
          containerRef.current.style.width = `${DEFAULT_WIDTH_PERCENTAGE}%`;
        }
        
        // Notify about the new width
        dispatchResizeEvent(currentWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial dispatch
    if (!isCollapsed) {
      dispatchResizeEvent(getWidthInPixels());
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isCollapsed]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "h-full flex flex-col bg-muted/30 border-r border-border relative ai-assistant-container",
        isCollapsed ? "w-[60px]" : "",
        "transition-all duration-300",
        className
      )}
      style={{ 
        width: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${DEFAULT_WIDTH_PERCENTAGE}%`,
        minWidth: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${MIN_WIDTH_PIXELS}px`,
        maxWidth: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${MAX_WIDTH_PIXELS}px`
      }}
      data-width={isCollapsed ? COLLAPSED_WIDTH : getWidthInPixels()}
    >
      <AiAssistantContent 
        variant="desktop"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
    </div>
  );
};

/**
 * Mobile variant of the AI Assistant
 */
export const MobileAiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed left-4 bottom-4 rounded-full shadow-lg z-50 p-0 h-12 w-12"
          size="icon"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] h-[80vh] flex flex-col p-0">
        <AiAssistantContent 
          variant="mobile"
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}; 