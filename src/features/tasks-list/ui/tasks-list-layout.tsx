import { cn } from '../../../shared/lib/utils';
import { TasksListLayoutProps } from '../model/types';
import { Card } from '../../../shared/ui/card';

export function TasksListLayout({
  header,
  content,
  footer,
  className,
}: TasksListLayoutProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header section with search, filters, and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {header}
      </div>
      
      {/* Main content with tasks list */}
      <Card className="overflow-hidden">
        <div className="p-1">
          {content}
        </div>
      </Card>
      
      {/* Footer with pagination or load more */}
      {footer && (
        <div className="flex justify-center mt-4">
          {footer}
        </div>
      )}
    </div>
  );
} 