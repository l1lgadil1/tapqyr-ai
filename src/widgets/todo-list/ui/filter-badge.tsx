import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/lib/utils';

interface FilterBadgeProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  'aria-label'?: string;
}

export function FilterBadge({ 
  icon, 
  count, 
  label, 
  isActive = false, 
  onClick,
  'aria-label': ariaLabel
}: FilterBadgeProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "filter-badge relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        "border shadow-sm hover:shadow-md transition-all duration-200 ease-in-out",
        "overflow-hidden backdrop-blur-sm",
        isActive 
          ? "bg-primary text-primary-foreground border-primary/50" 
          : "bg-background/80 hover:bg-accent/5 border-border"
      )}
      aria-label={ariaLabel}
      role="button"
    >
      <span className={cn(
        "relative z-10 flex items-center justify-center transition-transform duration-200 ease-out",
        isActive ? "text-primary-foreground" : "text-muted-foreground"
      )}>
        {icon}
      </span>
      <span className="relative z-10 flex items-center gap-1">
        <span className={cn(
          "font-semibold transition-colors duration-200 ease-out",
          isActive ? "text-primary-foreground" : "text-foreground"
        )}>
          {count}
        </span>
        <span className={cn(
          "transition-colors duration-200 ease-out",
          isActive ? "text-primary-foreground/90" : "text-muted-foreground"
        )}>
          {label}
        </span>
      </span>
      {isActive && (
        <motion.span
          className="absolute inset-0 bg-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ borderRadius: 'inherit' }}
        />
      )}
    </motion.button>
  );
} 