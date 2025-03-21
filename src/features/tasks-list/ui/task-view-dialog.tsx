import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../../../shared/ui/dialog/dialog';
import { Button } from '../../../shared/ui/button';
import { CheckCircle2, Clock, AlertTriangle, Edit, CalendarDays, Save, X, ChevronLeft } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { Task } from '../model/types';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

export interface TaskViewDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Partial<Task>) => Promise<void>;
}

export function TaskViewDialog({
  task,
  open,
  onOpenChange,
  onSave,
}: TaskViewDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Reset state when modal opens/closes or task changes
  useEffect(() => {
    if (open && task) {
      setIsEditMode(false);
      setIsSubmitting(false);
      setHasChanges(false);
      setFormData({});
    }
  }, [open, task]);

  // Register keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key already handled by the Dialog component

      // Ctrl/Cmd + E to enter edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !isEditMode) {
        e.preventDefault();
        handleStartEdit();
      }

      // Ctrl/Cmd + S to save in edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditMode && !isSubmitting) {
        e.preventDefault();
        handleSaveChanges();
      }

      // Ctrl/Cmd + Enter to save in edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isEditMode && !isSubmitting) {
        e.preventDefault();
        handleSaveChanges();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isEditMode, isSubmitting]);

  if (!task) return null;
  
  const priorityConfig = {
    low: { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, text: 'text-green-500', bg: 'bg-green-500/10' },
    medium: { icon: <Clock className="h-4 w-4 text-blue-500" />, text: 'text-blue-500', bg: 'bg-blue-500/10' },
    high: { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, text: 'text-red-500', bg: 'bg-red-500/10' },
  };

  // Format created or updated date if available
  const formattedDate = task.updatedAt || task.createdAt 
    ? formatDistanceToNow(new Date(task.updatedAt || task.createdAt || ''), { addSuffix: true })
    : null;
  
  // Initialize form data when entering edit mode
  const handleStartEdit = () => {
    setFormData({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimatedTime: task.estimatedTime,
      completed: task.completed
    });
    setIsEditMode(true);
    setHasChanges(false);
  };
  
  // Handle form data changes
  const handleFormChange = (field: keyof Task, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark that changes have been made
    if (!hasChanges) {
      setHasChanges(true);
    }
  };
  
  // Handle save
  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      await onSave({ ...formData, id: task.id });
      setIsEditMode(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }
    setIsEditMode(false);
    setHasChanges(false);
  };
  
  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open && isEditMode && hasChanges) {
      // Ask for confirmation before closing if in edit mode with unsaved changes
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    
    if (!open) {
      setIsEditMode(false);
      setHasChanges(false);
    }
    
    onOpenChange(open);
  };
  
  // Priority options for the dropdown
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', icon: <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> },
    { value: 'medium', label: 'Medium Priority', icon: <Clock className="h-4 w-4 text-blue-500 mr-2" /> },
    { value: 'high', label: 'High Priority', icon: <AlertTriangle className="h-4 w-4 text-red-500 mr-2" /> },
  ];
  
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className={cn(
        "sm:max-w-[500px] transition-all duration-200 ease-in-out",
        isEditMode ? "sm:max-w-[550px]" : "sm:max-w-[500px]"
      )}>
        <DialogHeader className="relative">
          {isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-0 h-8 w-8 rounded-full hover:bg-white/10"
              onClick={handleCancelEdit}
              aria-label="Cancel editing"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? (
              <Input
                value={formData.title || ''}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className="w-full bg-background/50 border-primary/20 focus:border-primary/40 transition-all text-xl"
                placeholder="Task title"
                autoFocus
              />
            ) : (
              task.title
            )}
          </DialogTitle>
          
          {isEditMode && (
            <p className="text-xs text-muted-foreground mt-1">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd> or <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd+S</kbd> to save
            </p>
          )}
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Status/Priority Row */}
          <div className="flex items-center justify-between">
            {isEditMode ? (
              <div className="flex items-center gap-4 w-full">
                {/* Status in Edit Mode */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="task-completed"
                    checked={formData.completed}
                    onChange={(e) => handleFormChange('completed', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/25"
                  />
                  <label htmlFor="task-completed" className="text-sm font-medium">
                    {formData.completed ? "Completed" : "In Progress"}
                  </label>
                </div>
                
                {/* Priority in Edit Mode */}
                <div className="w-full max-w-[200px]">
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleFormChange('priority', value)}
                  >
                    <SelectTrigger 
                      className={cn(
                        "bg-background/50 border-primary/20 transition-all h-9",
                        formData.priority === 'high' && "text-red-500",
                        formData.priority === 'medium' && "text-blue-500",
                        formData.priority === 'low' && "text-green-500"
                      )}
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/90 backdrop-blur-md border-primary/20">
                      {priorityOptions.map(option => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="flex items-center"
                        >
                          <div className="flex items-center">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <>
                {/* Status in View Mode */}
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5",
                  task.completed ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {task.completed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>In Progress</span>
                    </>
                  )}
                </div>
                
                {/* Priority in View Mode */}
                {task.priority && (
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
                    priorityConfig[task.priority].bg,
                    priorityConfig[task.priority].text
                  )}>
                    {priorityConfig[task.priority].icon}
                    <span className="capitalize">{task.priority} Priority</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Description
              {!isEditMode && !task.description && (
                <span className="text-xs italic text-muted-foreground/70">(none)</span>
              )}
            </h3>
            {isEditMode ? (
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Add a description..."
                className="w-full min-h-[100px] bg-background/50 border-primary/20 focus:border-primary/40 transition-all"
              />
            ) : (
              task.description ? (
                <div className="text-sm p-3 rounded-md bg-background/50 border border-border">
                  {task.description}
                </div>
              ) : (
                <div 
                  className="text-sm p-3 rounded-md bg-background/50 border border-border border-dashed text-muted-foreground italic cursor-pointer hover:bg-background/80 transition-colors"
                  onClick={handleStartEdit}
                >
                  Click to add a description
                </div>
              )
            )}
          </div>
          
          {/* Task Details */}
          <div className="grid grid-cols-1 gap-4">
            {/* Estimated Time */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground">Estimated Time</h3>
                {isEditMode ? (
                  <Input
                    value={formData.estimatedTime || ''}
                    onChange={(e) => handleFormChange('estimatedTime', e.target.value)}
                    placeholder="e.g. 2 hours"
                    className="w-full bg-background/50 border-primary/20 focus:border-primary/40 transition-all mt-1"
                  />
                ) : (
                  <p className="text-sm">
                    {task.estimatedTime || (
                      <span 
                        className="text-muted-foreground/70 italic cursor-pointer hover:text-muted-foreground transition-colors"
                        onClick={handleStartEdit}
                      >
                        Not specified (click to add)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            {/* Created/Updated Date */}
            {formattedDate && !isEditMode && (
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {task.updatedAt ? "Last Updated" : "Created"}
                  </h3>
                  <p className="text-sm">{formattedDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <AnimatePresence mode="wait">
            {isEditMode ? (
              <motion.div 
                key="edit-buttons"
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  className="border-primary/20 hover:bg-primary/5"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="button"
                  className="ai-glow ai-border"
                  onClick={handleSaveChanges}
                  disabled={isSubmitting || !hasChanges}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" strokeOpacity="0.2" />
                        <path d="M12 2C6.47715 2 2 6.47715 2 12" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="view-buttons"
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  Close
                </Button>
                <Button 
                  type="button"
                  className="ai-glow ai-border"
                  onClick={handleStartEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogFooter>
        
        {!isEditMode && (
          <div className="absolute top-2 right-2 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+E</kbd> or <kbd className="px-1.5 py-0.5 bg-muted rounded">Cmd+E</kbd> to edit
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 