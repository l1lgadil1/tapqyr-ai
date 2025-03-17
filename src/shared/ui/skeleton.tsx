import { cn } from "../lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-primary/10",
        className
      )}
    />
  );
}

export function TodoSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      "glass-panel p-4 rounded-lg relative overflow-hidden",
      compact ? "p-3" : "p-4"
    )}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded-full mt-1" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-[60%]" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-[80%]" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TodoListSkeleton({ count = 5, compact = false }: { count?: number; compact?: boolean }) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {Array.from({ length: count }).map((_, index) => (
        <TodoSkeleton key={index} compact={compact} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="holographic-card overflow-hidden h-full">
      <div className="p-6 flex flex-col items-center">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-10 w-16 mb-4" />
        <Skeleton className="h-4 w-full rounded-full" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="holographic-card rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <TodoListSkeleton count={3} compact />
        </div>
        <div className="holographic-card rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <TodoListSkeleton count={3} compact />
        </div>
      </div>
    </div>
  );
}

export function AIPromptSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-center">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-6 w-[70%] mx-auto" />
      <Skeleton className="h-4 w-[50%] mx-auto" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-32 rounded-full" />
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
    </div>
  );
} 