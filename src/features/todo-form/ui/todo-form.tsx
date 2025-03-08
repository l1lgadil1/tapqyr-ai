import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Calendar } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { Todo } from '../../../widgets/todo-list';

interface TodoFormProps {
  todo?: Todo | null;
  onSubmit: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  className?: string;
}

export function TodoForm({
  todo,
  onSubmit,
  onCancel,
  className,
}: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onSubmit({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completed: todo?.completed || false,
    });
    
    // Reset form
    if (!todo) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
          className="w-full bg-background/50 border-primary/20 focus:border-primary/40"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description (optional)"
          className="w-full min-h-[100px] bg-background/50 border-primary/20 focus:border-primary/40"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={priority} 
            onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
          >
            <SelectTrigger id="priority" className="bg-background/50 border-primary/20">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <div className="relative">
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-background/50 border-primary/20 focus:border-primary/40"
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
        >
          Cancel
        </Button>
        <Button type="submit" className="ai-glow ai-border">
          {todo ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
} 