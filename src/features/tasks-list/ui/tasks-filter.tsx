import { Button } from '../../../shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { cn } from '../../../shared/lib/utils';
import { FilterType, PriorityFilter, TasksFilterProps } from '../model/types';
import { CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import { Badge } from '../../../shared/ui/badge';

export function TasksFilter({
  statusFilter,
  priorityFilter,
  onStatusFilterChange,
  onPriorityFilterChange,
  onClearFilters,
  className,
}: TasksFilterProps) {
  const handleStatusChange = (value: string) => {
    onStatusFilterChange(value as FilterType);
  };

  const handlePriorityChange = (value: string) => {
    onPriorityFilterChange(value as PriorityFilter);
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Select value={statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tasks</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={handlePriorityChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="low">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Low</span>
            </div>
          </SelectItem>
          <SelectItem value="medium">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Medium</span>
            </div>
          </SelectItem>
          <SelectItem value="high">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>High</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-1"
        >
          <X className="h-3 w-3" />
          <span>Clear</span>
          <Badge variant="secondary" className="ml-1 px-1">
            {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
          </Badge>
        </Button>
      )}
    </div>
  );
} 