import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Calendar, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { TodoItem } from '../../../widgets/todo-list/types';
import { useTranslation } from '../../../shared/lib/i18n';
import { z } from 'zod';

interface TodoFormProps {
  todo?: TodoItem | null;
  onSubmit: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  className?: string;
}

// Define validation schema
const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
});

type FormErrors = {
  title?: string;
  description?: string;
  dueDate?: string;
};

export function TodoForm({
  todo,
  onSubmit,
  onCancel,
  className,
}: TodoFormProps) {
  const { t } = useTranslation('todo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with todo data if provided
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority || 'medium');
      setDueDate(
        todo.dueDate 
          ? new Date(todo.dueDate).toISOString().split('T')[0] 
          : ''
      );
    }
  }, [todo]);
  
  const validateForm = useCallback((): boolean => {
    try {
      todoSchema.parse({
        title,
        description,
        priority,
        dueDate,
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
  }, [title, description, priority, dueDate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Handle dueDate properly
      const formattedDueDate = dueDate ? dueDate : undefined;
      
      await onSubmit({
        title,
        description,
        completed: todo?.completed || false,
        dueDate: formattedDueDate,
        priority,
        isAIGenerated: todo?.isAIGenerated || false
      });
      
      // Reset form if not editing
      if (!todo) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setErrors({});
      }
    } catch (error) {
      console.error('Error submitting todo:', error);
      setErrors({
        title: t('form.submitError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const priorityOptions = [
    { value: 'low', label: t('form.lowPriority'), icon: <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> },
    { value: 'medium', label: t('form.mediumPriority'), icon: <Clock className="h-4 w-4 text-blue-500 mr-2" /> },
    { value: 'high', label: t('form.highPriority'), icon: <AlertTriangle className="h-4 w-4 text-red-500 mr-2" /> },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("glass-panel p-6 rounded-lg", className)}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            {t('form.title')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setErrors({});
            }}
            placeholder={t('form.titlePlaceholder')}
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
            {t('form.description')}
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('form.descriptionPlaceholder')}
            className="w-full min-h-[100px] bg-background/50 border-primary/20 focus:border-primary/40 transition-all"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              {t('form.priority')}
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
                <SelectValue placeholder={t('form.selectPriority')} />
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
            <Label htmlFor="dueDate" className="text-sm font-medium">
              {t('form.dueDate')}
            </Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-background/50 border-primary/20 focus:border-primary/40 transition-all"
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-primary/20 hover:bg-primary/5"
            disabled={isSubmitting}
          >
            {t('form.cancel')}
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
                {todo ? t('form.updating') : t('form.adding')}
              </>
            ) : (
              todo ? t('form.updateTask') : t('form.addTask')
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 