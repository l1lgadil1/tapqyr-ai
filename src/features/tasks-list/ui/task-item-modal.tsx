import { Clock, Edit, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '../../../shared/ui/dialog/dialog';
import { Button } from '../../../shared/ui/button';
import { Checkbox } from '../../../shared/ui/checkbox';
import { cn } from '../../../shared/lib/utils';
import { Task } from '../model/types';

interface TaskItemModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItemModal({
  task,
  open,
  onOpenChange,
  onToggle,
  onEdit,
  onDelete
}: TaskItemModalProps) {
  if (!task) return null;

  const isCompleted = typeof task.completed === 'string' 
    ? task.completed === 'true' 
    : Boolean(task.completed);

  const priorityColors = {
    low: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-500',
      icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
    },
    medium: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      icon: <Clock className="h-4 w-4 mr-1" />,
    },
    high: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-500',
      icon: <AlertTriangle className="h-4 w-4 mr-1" />,
    },
  };

  const handleDelete = () => {
    onOpenChange(false);
    // Add a small delay to allow the modal to close before deleting
    setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex-1">{task.title}</span>
            {task.priority && (
              <span 
                className={cn(
                  "text-xs px-2 py-1 rounded-full border flex items-center",
                  priorityColors[task.priority].bg,
                  priorityColors[task.priority].border,
                  priorityColors[task.priority].text
                )}
              >
                {priorityColors[task.priority].icon}
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {task.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}
          
          {task.estimatedTime && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Estimated Time</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>{task.estimatedTime}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center mt-6 space-x-2">
            <Checkbox 
              id="task-completed"
              checked={isCompleted} 
              onCheckedChange={() => onToggle(task.id)}
              className={cn(
                "transition-all duration-300 border-2 relative overflow-hidden",
                isCompleted ? "border-primary" : "border-primary/50"
              )}
            />
            <label 
              htmlFor="task-completed" 
              className="text-sm font-medium cursor-pointer"
            >
              {isCompleted ? "Completed" : "Mark as completed"}
            </label>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={() => {
              onOpenChange(false);
              onEdit(task.id);
            }}
          >
            <Edit className="h-4 w-4" />
            Edit Task
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 