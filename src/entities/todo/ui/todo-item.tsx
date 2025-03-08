import { useState } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Button } from '../../../shared/ui/button';
import { Trash2, Edit, Clock, AlertTriangle, CheckCircle2, BrainCircuit } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

export interface TodoItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  isAIGenerated?: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  className?: string;
}

export function TodoItem({
  id,
  title,
  description,
  completed,
  dueDate,
  priority = 'medium',
  isAIGenerated,
  onToggle,
  onDelete,
  onEdit,
  className,
}: TodoItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
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
    onToggle(id, !completed);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-lg neon-border scan-effect',
        completed ? 'bg-secondary/10' : 'holographic-card',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Glow effect on hover */}
      <div 
        className={`absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : ''}`}
      />
      
      <div className="flex items-start gap-3 relative z-10">
        <div className="flex-shrink-0 pt-0.5">
          <Checkbox 
            checked={completed} 
            onCheckedChange={handleToggle}
            className={cn(
              "transition-all duration-300 border-2 relative overflow-hidden",
              completed ? "border-primary" : "border-primary/50",
              isHovered && !completed && "animate-pulse-glow"
            )}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 
              className={cn(
                "text-base font-medium transition-all duration-300",
                completed ? "line-through opacity-70" : "neon-text"
              )}
            >
              {title}
            </h3>
            
            {isAIGenerated && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full flex items-center ai-badge"
                title="AI Generated Task"
              >
                <BrainCircuit className="h-3 w-3 mr-1" />
                AI
              </span>
            )}
            
            {priority && (
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
            )}
          </div>
          
          {description && (
            <motion.p 
              className={cn(
                "text-sm text-muted-foreground mb-2",
                completed && "opacity-50"
              )}
              animate={{ opacity: completed ? 0.5 : 1 }}
            >
              {description}
            </motion.p>
          )}
          
          {dueDate && (
            <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2 bg-background/30 px-2 py-1 rounded-md backdrop-blur-sm w-fit">
              <Clock className="h-3 w-3" />
              <span>{formatDate(dueDate)}</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center gap-1 transition-all duration-300",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-white/10 hover:text-primary hover:shadow-[0_0_10px_-2px_hsl(var(--primary))]"
            onClick={() => onEdit(id)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-white/10 hover:text-destructive hover:shadow-[0_0_10px_-2px_hsl(var(--destructive))]"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
      
      {/* Progress indicator */}
      <motion.div 
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-accent"
        initial={{ width: completed ? "100%" : "0%" }}
        animate={{ width: completed ? "100%" : "0%" }}
        transition={{ duration: 0.5 }}
        style={{
          boxShadow: completed ? '0 0 10px -2px hsl(var(--primary))' : 'none'
        }}
      />
    </motion.div>
  );
} 