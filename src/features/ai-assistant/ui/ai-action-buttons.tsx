import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../shared/ui/button';
import { 
  Check, 
  X, 
  Trash2, 
  Edit, 
  Plus, 
  ListChecks, 
  BarChart4, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

export interface ActionButton {
  id: string;
  label: string;
  action: string;
  icon: 'create' | 'edit' | 'delete' | 'complete' | 'analyze' | 'schedule' | 'list' | 'custom';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  data?: Record<string, unknown>;
  requiresConfirmation?: boolean;
  messageContext?: string; // The context from the message that generated this action
  chatHistory?: string; // The chat history for additional context
}

interface AIActionButtonsProps {
  actions: ActionButton[];
  onActionClick: (action: ActionButton) => void;
  onDismiss: () => void;
  messageContext?: string; // The context from the current message
  chatHistory?: string; // The chat history for additional context
  className?: string;
}

export function AIActionButtons({ 
  actions, 
  onActionClick, 
  onDismiss,
  messageContext,
  chatHistory,
  className 
}: AIActionButtonsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<ActionButton | null>(null);
  
  const handleActionClick = (action: ActionButton) => {
    setSelectedAction(action.id);
    
    // Enhance the action with message context if available
    const enhancedAction = {
      ...action,
      messageContext: action.messageContext || messageContext,
      chatHistory: action.chatHistory || chatHistory
    };
    
    // Check if this action requires confirmation
    if (enhancedAction.requiresConfirmation || enhancedAction.icon === 'delete') {
      setConfirmingAction(enhancedAction);
      return;
    }
    
    // Small delay to show the selection before executing the action
    setTimeout(() => {
      onActionClick(enhancedAction);
      setSelectedAction(null);
    }, 300);
  };
  
  const handleConfirmAction = () => {
    if (!confirmingAction) return;
    
    onActionClick(confirmingAction);
    setSelectedAction(null);
    setConfirmingAction(null);
  };
  
  const handleCancelAction = () => {
    setSelectedAction(null);
    setConfirmingAction(null);
  };
  
  // Map action icons to Lucide components
  const getActionIcon = (icon: ActionButton['icon']) => {
    switch (icon) {
      case 'create':
        return <Plus className="h-4 w-4 mr-2" />;
      case 'edit':
        return <Edit className="h-4 w-4 mr-2" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 mr-2" />;
      case 'complete':
        return <Check className="h-4 w-4 mr-2" />;
      case 'analyze':
        return <BarChart4 className="h-4 w-4 mr-2" />;
      case 'schedule':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'list':
        return <ListChecks className="h-4 w-4 mr-2" />;
      default:
        return <Plus className="h-4 w-4 mr-2" />;
    }
  };
  
  // Get button variant based on action type
  const getButtonVariant = (action: ActionButton): ActionButton['variant'] => {
    if (action.variant) return action.variant;
    
    switch (action.icon) {
      case 'create':
        return 'default';
      case 'edit':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'complete':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className={cn(
          "flex flex-col gap-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border",
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground">Suggested actions:</p>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 rounded-full"
            onClick={onDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {confirmingAction ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p>Are you sure you want me to {confirmingAction.label.toLowerCase()}?</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCancelAction}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant={getButtonVariant(confirmingAction)}
                size="sm"
                className="flex-1"
                onClick={handleConfirmAction}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={getButtonVariant(action)}
                size="sm"
                className={cn(
                  "transition-all duration-300",
                  selectedAction === action.id && "scale-95"
                )}
                onClick={() => handleActionClick(action)}
              >
                {getActionIcon(action.icon)}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
} 