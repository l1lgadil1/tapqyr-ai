import { useState, useRef, useEffect } from 'react';
import { Bot, X, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '../../../shared/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../../../shared/ui/dialog';
import { ScrollArea } from '../../../shared/ui/scroll-area';
import { cn } from '../../../shared/lib/utils';

interface AiAssistantProps {
  className?: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Sample messages for demonstration
const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! I\'m your personal assistant. How can I help you today?',
    isUser: false,
    timestamp: new Date(Date.now() - 60000 * 5),
  },
];

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

export const AiAssistant = ({ className }: AiAssistantProps) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage for collapsed state
    const savedState = localStorage.getItem('aiAssistant.collapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I\'m processing your request. This is a simulated response for demonstration purposes.',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

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
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("ml-auto", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <>
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
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
            </div>
          </ScrollArea>
          
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
              />
              <Button 
                size="icon" 
                className="shrink-0"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const MobileAiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
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
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I\'m processing your request. This is a simulated response for demonstration purposes.',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };
  
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
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Tapqyr AI</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
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
          </div>
        </ScrollArea>
        
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
            />
            <Button 
              size="icon" 
              className="shrink-0"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 