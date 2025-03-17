import { useState, useEffect } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../../../shared/ui/dialog/dialog';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { Task } from '../model/types';

// Define validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium' ,'high']),
  estimatedTime: z.string().optional(),
});

type FormErrors = {
  title?: string;
  description?: string;
  estimatedTime?: string;
};

export interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Partial<Task>) => Promise<void>;
}

export function TaskEditDialog({
  task,
  open,
  onOpenChange,
  onSave,
}: TaskEditDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isCreateMode = !task;
  
  // Initialize form with task data when opened or reset for creation
  useEffect(() => {
    if (open) {
      if (task) {
        // Edit mode - populate with task data
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority || 'medium');
        setEstimatedTime(task.estimatedTime || '');
      } else {
        // Create mode - reset to defaults
        setTitle('');
        setDescription('');
        setPriority('medium');
        setEstimatedTime('');
      }
      setErrors({});
    }
  }, [task, open]);
  
  const validateForm = (): boolean => {
    try {
      taskSchema.parse({
        title,
        description,
        priority,
        estimatedTime,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (path && typeof path === 'string') {
            newErrors[path as keyof FormErrors] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const taskData: Partial<Task> = {
        title,
        description: description || undefined,
        priority,
        estimatedTime: estimatedTime || undefined,
      };
      
      // Add ID only if in edit mode
      if (task) {
        taskData.id = task.id;
      }
      
      await onSave(taskData);
      onOpenChange(false);
    } catch (error) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} task:`, error);
      setErrors({
        title: `Failed to ${isCreateMode ? 'create' : 'update'} task`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', icon: <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> },
    { value: 'medium', label: 'Medium Priority', icon: <Clock className="h-4 w-4 text-blue-500 mr-2" /> },
    { value: 'high', label: 'High Priority', icon: <AlertTriangle className="h-4 w-4 text-red-500 mr-2" /> },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? 'Create Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
              placeholder="Task title"
              required
              className={cn(
                "w-full bg-background/50 border-primary/20 focus:border-primary/40 transition-all",
                errors.title && "border-red-500 focus:border-red-500"
              )}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <motion.p 
                id="title-error"
                className="text-red-500 text-sm mt-1 flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {errors.title}
              </motion.p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="w-full min-h-[100px] bg-background/50 border-primary/20 focus:border-primary/40 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select 
                value={priority} 
                onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger 
                  id="priority" 
                  className={cn(
                    "bg-background/50 border-primary/20 transition-all",
                    priority === 'high' && "text-red-500",
                    priority === 'medium' && "text-blue-500",
                    priority === 'low' && "text-green-500"
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
            
            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="text-sm font-medium">
                Estimated Time
              </Label>
              <Input
                id="estimatedTime"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g. 2 hours"
                className="w-full bg-background/50 border-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-primary/20 hover:bg-primary/5"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="ai-glow ai-border"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
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
                  {isCreateMode ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                isCreateMode ? 'Create Task' : 'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 