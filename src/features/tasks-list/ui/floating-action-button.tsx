import { Plus } from 'lucide-react';
import { Button } from '../../../shared/ui/button';
import { cn } from '../../../shared/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 p-0 flex items-center justify-center',
        'bg-primary hover:bg-primary/90 text-primary-foreground',
        'transition-all duration-300 ease-in-out hover:scale-105',
        'z-50',
        className
      )}
      aria-label="Add new task"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
} 