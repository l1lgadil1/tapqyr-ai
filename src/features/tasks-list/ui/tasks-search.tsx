import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { TasksSearchProps } from '../model/types';

export function TasksSearch({
  value,
  onChange,
  onClear,
  className,
}: TasksSearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search tasks..."
        value={value}
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={onClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 