import { ReactNode, useEffect, useState, useRef } from 'react';
import { AiAssistant } from '../../../features/ai-assistant';
import { MobileAiAssistant } from '../../../features/ai-assistant/ui/ai-assistant';
import { cn } from '../../../shared/lib/utils';
import { useLocation } from 'react-router-dom';

interface SplitLayoutProps {
  children: ReactNode;
  className?: string;
}

// Width configuration
const COLLAPSED_WIDTH = 60; // Keep collapsed width fixed in pixels
const DEFAULT_WIDTH_PERCENTAGE = 25; // Default width as percentage of screen

// Custom event name for AI Assistant resize
const RESIZE_EVENT_NAME = 'aiAssistantResize';

export const SplitLayout = ({ children, className }: SplitLayoutProps) => {
  const location = useLocation();
  const isHideChat = ['/','/auth/login','/auth/register'].some(i=>location.pathname === i)
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [aiWidth, setAiWidth] = useState(() => {
    const savedCollapsed = localStorage.getItem('aiAssistant.collapsed');
    const isCollapsed = savedCollapsed ? JSON.parse(savedCollapsed) : false;
    
    if (isCollapsed) return COLLAPSED_WIDTH;
    
    // Calculate initial width based on percentage
    const screenWidth = window.innerWidth;
    return Math.round(screenWidth * (DEFAULT_WIDTH_PERCENTAGE / 100));
  });
  
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // Listen for custom resize events and window resize
  useEffect(() => {
    const handleResizeEvent = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.width === 'number') {
        setAiWidth(e.detail.width);
      }
    };
    
    const handleStorageChange = () => {
      const savedCollapsed = localStorage.getItem('aiAssistant.collapsed');
      const isCollapsed = savedCollapsed ? JSON.parse(savedCollapsed) : false;
      
      if (isCollapsed) {
        setAiWidth(COLLAPSED_WIDTH);
      } else {
        // Calculate width based on percentage
        const screenWidth = window.innerWidth;
        setAiWidth(Math.round(screenWidth * (DEFAULT_WIDTH_PERCENTAGE / 100)));
      }
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Listen for our custom resize event
    window.addEventListener(RESIZE_EVENT_NAME, handleResizeEvent as EventListener);
    
    // Also listen for storage events as a fallback
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener(RESIZE_EVENT_NAME, handleResizeEvent as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update margin when aiWidth changes
  useEffect(() => {
    if (contentRef.current && !isHideChat && !isMobile) {
      contentRef.current.style.marginLeft = `${aiWidth}px`;
    }
  }, [aiWidth, isHideChat, isMobile]);

  return (
    <div className={cn("flex flex-1 w-full h-full", className)}>
      {/* Desktop AI Assistant - hidden on mobile and home page */}
      {!isHideChat && (
        <div className="hidden md:block h-full flex-shrink-0">
          <AiAssistant className="h-full fixed top-0 bottom-0 left-0 z-10" />
        </div>
      )}
      
      {/* Main content area - adjusted to account for AI Assistant */}
      <div 
        ref={contentRef}
        className="flex-1 w-full transition-all duration-300"
        style={{ marginLeft: !isMobile && !isHideChat ? `${aiWidth}px` : 0 }}
      >
        {children}
      </div>
      
      {/* Mobile AI Assistant - only visible on mobile and not on home page */}
      {!isHideChat && (
        <div className="md:hidden">
          <MobileAiAssistant />
        </div>
      )}
    </div>
  );
}; 