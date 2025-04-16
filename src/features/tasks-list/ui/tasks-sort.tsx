import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { cn } from '../../../shared/lib/utils';
import { SortType, TasksSortProps } from '../model/types';
import { ArrowDownAZ, ArrowUpAZ, Clock, AlertTriangle, Calendar } from 'lucide-react';

export function TasksSort({
  value,
  onChange,
  className,
}: TasksSortProps) {
  const handleValueChange = (newValue: string) => {
    onChange(newValue as SortType);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">
            <div className="flex items-center gap-2">
              <ArrowDownAZ className="h-4 w-4" />
              <span>Newest first</span>
            </div>
          </SelectItem>
          <SelectItem value="oldest">
            <div className="flex items-center gap-2">
              <ArrowUpAZ className="h-4 w-4" />
              <span>Oldest first</span>
            </div>
          </SelectItem>
          <SelectItem value="priority">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Priority</span>
            </div>
          </SelectItem>
          <SelectItem value="estimatedTime">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Estimated time</span>
            </div>
          </SelectItem>
          <SelectItem value="createdAt">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created At</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 