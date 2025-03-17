// Export main component
export { TasksList } from './ui/tasks-list';

// Export individual components
export { TaskItem } from './ui/task-item';
export { TasksListLayout } from './ui/tasks-list-layout';
export { TasksSearch } from './ui/tasks-search';
export { TasksSort } from './ui/tasks-sort';
export { TasksFilter } from './ui/tasks-filter';
export { FloatingActionButton } from './ui/floating-action-button';


// Export API
export { tasksApi } from './model/api';
export {TasksList as TaskListExample} from './component'
 
// Export hooks
export { useTasks, useTasksFilters } from './model/hooks';
export type { UseTasksOptions, UseTasksReturn } from './model/hooks/use-tasks';
export type { UseTasksFiltersOptions, UseTasksFiltersReturn } from './model/hooks/use-tasks-filters';

// Export types
export type {
  Task,
  TaskResponse,
  SortType,
  FilterType,
  PriorityFilter,
  TaskFetchParams,
  TaskApiResponse,
  TasksListProps,
  TaskItemProps,
  TasksListLayoutProps,
  TasksSearchProps,
  TasksSortProps,
  TasksFilterProps,
} from './model/types'; 