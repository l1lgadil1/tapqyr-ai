import { ReactNode } from 'react';
import { Badge } from '../../../shared/ui/badge';
import { cn } from '../../../shared/lib/utils';
import { motion } from 'framer-motion';

interface StatBadgeProps {
  icon: ReactNode;
  count: number;
  label: string;
  iconColor?: string;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function StatBadge({
  icon,
  count,
  label,
  iconColor,
  onClick,
  isActive = false,
  className
}: StatBadgeProps) {
  return (
    <Badge 
      variant={isActive ? "default" : "outline"} 
      className={cn(
        "flex items-center gap-1 cursor-pointer transition-all duration-300 hover:shadow-md",
        isActive ? "bg-primary/20 text-primary border-primary" : "bg-background/30 hover:bg-background/50 border-primary/10 hover:border-primary/30",
        className
      )}
      onClick={onClick}
    >
      <span className={cn("flex-shrink-0", iconColor)}>
        {icon}
      </span>
      <span className="font-medium">{count}</span>
      <span>{label}</span>
      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          layoutId="activeBadge"
        />
      )}
    </Badge>
  );
} 