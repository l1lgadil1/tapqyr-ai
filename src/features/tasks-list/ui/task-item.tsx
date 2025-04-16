import { useState } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Button } from '../../../shared/ui/button';
import { Trash2, Edit, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { CustomTooltip } from '../../../shared/ui/custom-tooltip';
import { TaskItemProps } from '../model/types';
import { Skeleton } from '../../../shared/ui/skeleton';

export function TaskItem({
  id,
  title,
  description,
  completed,
  priority = 'medium',
  estimatedTime,
  isUpdating = false,
  onToggle,
  onDelete,
  onEdit,
  className,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Ensure completed is always a boolean
  const isCompleted = typeof completed === 'string' ? completed === 'true' : Boolean(completed);
  
  // If the item is updating, show a skeleton
  if (isUpdating) {
    return <TaskItemSkeleton />;
  }
  
  const priorityColors = {
    low: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-500',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      glow: 'shadow-[0_0_8px_-2px_rgba(34,197,94,0.5)]'
    },
    medium: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      icon: <Clock className="h-3 w-3 mr-1" />,
      glow: 'shadow-[0_0_8px_-2px_rgba(59,130,246,0.5)]'
    },
    high: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-500',
      icon: <AlertTriangle className="h-3 w-3 mr-1" />,
      glow: 'shadow-[0_0_8px_-2px_rgba(239,68,68,0.5)]'
    },
  };
  
  const handleToggle = () => {
    onToggle(id);
  };
  
  const handleDelete = () => {
    setIsDeleting(true);
    // Add a small delay for the animation to play
    setTimeout(() => {
      onDelete(id);
    }, 300);
  };
  
  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-lg border border-white/10',
        isCompleted ? 'bg-secondary/10' : 'bg-secondary/5',
        isDeleting && 'scale-95 opacity-0',
        'cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-300',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onEdit(id)}
    >
      {/* Glow effect on hover */}
      <div 
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 transition-opacity duration-300 pointer-events-none",
          isHovered ? 'opacity-100' : ''
        )}
      />
      
      {/* Indicator that task can be clicked to view details */}
      <div 
        className={cn(
          "absolute top-2 right-2 opacity-0 text-xs text-muted-foreground transition-opacity duration-300",
          isHovered ? 'opacity-70' : ''
        )}
      >
        Click to view
      </div>
      
      <div className="flex items-start gap-3 relative z-10">
        <div className="flex-shrink-0 pt-0.5" onClick={(e)=> e.stopPropagation()}>
          <CustomTooltip content={isCompleted ? "Mark as incomplete" : "Mark as complete"}>
            <Checkbox 
              checked={isCompleted} 
              onCheckedChange={handleToggle}
              className={cn(
                "transition-all duration-300 border-2 relative overflow-hidden",
                isCompleted ? "border-primary" : "border-primary/50",
                isHovered && !isCompleted && "animate-pulse"
              )}
              aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
            />
          </CustomTooltip>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 
              className={cn(
                "text-base font-medium transition-all duration-300",
                isCompleted ? "line-through opacity-70" : ""
              )}
            >
              {title}
            </h3>
            
            {priority && (
              <CustomTooltip content={`${priority.charAt(0).toUpperCase() + priority.slice(1)} priority`}>
                <span 
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border flex items-center",
                    priorityColors[priority].bg,
                    priorityColors[priority].border,
                    priorityColors[priority].text,
                    isHovered && priorityColors[priority].glow
                  )}
                >
                  {priorityColors[priority].icon}
                  {priority}
                </span>
              </CustomTooltip>
            )}
          </div>
          
          {description && (
            <motion.p 
              className={cn(
                "text-sm text-muted-foreground mb-2",
                isCompleted && "opacity-50"
              )}
              animate={{ opacity: isCompleted ? 0.5 : 1 }}
            >
              {description}
            </motion.p>
          )}
          
          {estimatedTime && (
            <div className={cn(
              "flex items-center text-xs gap-1 mt-2 px-2 py-1 rounded-md backdrop-blur-sm w-fit",
              "bg-background/30 text-muted-foreground"
            )}>
              <Clock className="h-3 w-3" />
              <span>{estimatedTime}</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center gap-1 transition-all duration-300",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <CustomTooltip content="Edit task">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              aria-label="Edit task"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CustomTooltip>
          
          <CustomTooltip content="Delete task">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/10 hover:text-destructive"
              onClick={e=>{
                e.stopPropagation();
                handleDelete();
              }}
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CustomTooltip>
        </div>
      </div>
      
      {/* Progress indicator */}
      <motion.div 
        className={cn(
          "absolute bottom-0 left-0 h-1",
          isCompleted ? "bg-gradient-to-r from-primary to-accent" : 
          "bg-gradient-to-r from-primary/50 to-accent/50"
        )}
        initial={{ width: isCompleted ? "100%" : "0%" }}
        animate={{ width: isCompleted ? "100%" : "0%" }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}

function TaskItemSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-white/10 bg-secondary/5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
} 