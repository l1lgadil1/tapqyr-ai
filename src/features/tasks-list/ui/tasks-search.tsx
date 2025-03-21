import { useState, useEffect } from 'react';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { TasksSearchProps } from '../model/types';
import { useDebouncedCallback } from '../../../shared/hooks/useDebounce';

export function TasksSearch({
  value,
  onChange,
  onClear,
  className,
}: TasksSearchProps) {
  // Local state for input
  const [localValue, setLocalValue] = useState(value);
  
  // Debounced callback for onChange
  const [debouncedOnChange] = useDebouncedCallback<(value: string) => void>(onChange, 300);
  
  // Sync local state with incoming prop when it changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };
  
  // Handle clear
  const handleClear = () => {
    setLocalValue('');
    // Call debouncedOnChange with empty string to ensure search is cleared
    debouncedOnChange('');
    // Then call onClear as a fallback or for additional behavior
    onClear();
  };

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search tasks..."
        value={localValue}
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 