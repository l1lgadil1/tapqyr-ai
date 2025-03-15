import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CustomTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  delayDuration?: number;
}

export function CustomTooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  className,
  delayDuration = 300,
}: CustomTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      setShouldRender(true);
      setIsOpen(true);
    }, delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsOpen(false);
    
    // Delay unmounting to allow exit animation to play
    setTimeout(() => {
      setShouldRender(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate position based on side and align
  const getPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return {};
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    switch (side) {
      case 'top':
        top = -tooltipRect.height - 8;
        break;
      case 'bottom':
        top = triggerRect.height + 8;
        break;
      case 'left':
        left = -tooltipRect.width - 8;
        top = (triggerRect.height - tooltipRect.height) / 2;
        break;
      case 'right':
        left = triggerRect.width + 8;
        top = (triggerRect.height - tooltipRect.height) / 2;
        break;
    }
    
    if ((side === 'top' || side === 'bottom') && align === 'center') {
      left = (triggerRect.width - tooltipRect.width) / 2;
    } else if ((side === 'top' || side === 'bottom') && align === 'start') {
      left = 0;
    } else if ((side === 'top' || side === 'bottom') && align === 'end') {
      left = triggerRect.width - tooltipRect.width;
    }
    
    if ((side === 'left' || side === 'right') && align === 'center') {
      top = (triggerRect.height - tooltipRect.height) / 2;
    } else if ((side === 'left' || side === 'right') && align === 'start') {
      top = 0;
    } else if ((side === 'left' || side === 'right') && align === 'end') {
      top = triggerRect.height - tooltipRect.height;
    }
    
    return { top, left };
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      ref={triggerRef}
    >
      {children}
      
      <AnimatePresence>
        {shouldRender && (
          <motion.div
            ref={tooltipRef}
            className={cn(
              "absolute z-50 px-3 py-1.5 text-sm rounded-md shadow-md",
              "bg-background/95 backdrop-blur-sm border border-primary/10 text-foreground",
              className
            )}
            style={getPosition()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 