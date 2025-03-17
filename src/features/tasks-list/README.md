# Tasks List Component

A reusable component for displaying, filtering, sorting, and managing tasks.

## Features

- Display tasks with priority, completion status, and estimated time
- Search functionality
- Sorting by newest, oldest, priority, or estimated time
- Filtering by status (all, active, completed) and priority (all, low, medium, high)
- View switching between all tasks, today's tasks, and upcoming tasks
- Dashboard statistics with completion rate
- Load more pagination
- Optimistic UI updates for task actions
- Responsive design

## Architecture

The component follows the Feature-Sliced Design (FSD) architecture with separation of concerns:

### Layers

- **UI**: Presentational components for rendering the UI
- **Model**: Business logic, API services, and types
  - **API**: API services for data fetching
  - **Hooks**: Custom hooks for state management and business logic
  - **Types**: TypeScript types and interfaces

### Segments

- **Tasks List**: Main feature for displaying and managing tasks
  - **UI**: TasksList, TaskItem, TasksListLayout, etc.
  - **Model**: API services, hooks, types

## Usage

### Basic Usage

```tsx
import { TasksList, useTasks } from 'features/tasks-list';

function TasksPage() {
  const {
    tasks,
    isLoading,
    error,
    hasMore,
    totalItems,
    updatingTaskIds,
    fetchTasks,
    loadMore,
    toggleTaskCompletion,
    deleteTask,
    editTask,
  } = useTasks();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      
      <TasksList
        tasks={tasks}
        onToggleComplete={toggleTaskCompletion}
        onDelete={deleteTask}
        onEdit={editTask}
        onSort={(sortBy) => fetchTasks({ sort: sortBy, page: 1 })}
        onFilter={fetchTasks}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        totalItems={totalItems}
        onLoadMore={loadMore}
        updatingTaskIds={updatingTaskIds}
      />
    </div>
  );
}
```

### Advanced Usage with Views and Stats

```tsx
import { useState } from 'react';
import { TasksList, useTasks } from 'features/tasks-list';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'shared/ui/tabs';

function TasksPageAdvanced() {
  const [activeView, setActiveView] = useState<'all' | 'today' | 'upcoming'>('all');
  
  const {
    tasks,
    isLoading,
    error,
    hasMore,
    totalItems,
    updatingTaskIds,
    fetchTasks,
    loadMore,
    toggleTaskCompletion,
    deleteTask,
    editTask,
    changeView,
    stats,
  } = useTasks({
    initialParams: {
      page: 1,
      limit: 10,
    },
    autoFetch: true,
    view: activeView,
  });

  // Handle view change
  const handleViewChange = (view: 'all' | 'today' | 'upcoming') => {
    setActiveView(view);
    changeView(view);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats summary */}
      {stats && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-secondary/10 rounded-lg px-3 py-2 text-sm">
            <span className="font-medium">{stats.activeTodos}</span> active
          </div>
          <div className="bg-secondary/10 rounded-lg px-3 py-2 text-sm">
            <span className="font-medium">{stats.completedTodos}</span> completed
          </div>
          {/* More stats... */}
        </div>
      )}
      
      <Tabs value={activeView} onValueChange={(value) => handleViewChange(value as 'all' | 'today' | 'upcoming')}>
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeView}>
          <TasksList
            tasks={tasks}
            onToggleComplete={toggleTaskCompletion}
            onDelete={deleteTask}
            onEdit={editTask}
            onSort={(sortBy) => fetchTasks({ sort: sortBy, page: 1 })}
            onFilter={fetchTasks}
            isLoading={isLoading}
            error={error}
            hasMore={hasMore}
            totalItems={totalItems}
            onLoadMore={loadMore}
            updatingTaskIds={updatingTaskIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Custom Hooks

#### `useTasks`

Manages tasks data fetching and state.

```tsx
const {
  tasks,                  // Array of tasks
  isLoading,              // Loading state
  error,                  // Error message if any
  hasMore,                // Whether there are more tasks to load
  totalItems,             // Total number of tasks
  currentPage,            // Current page number
  updatingTaskIds,        // Set of task IDs that are currently being updated
  fetchTasks,             // Function to fetch tasks with filters
  loadMore,               // Function to load more tasks
  toggleTaskCompletion,   // Function to toggle task completion
  deleteTask,             // Function to delete a task
  editTask,               // Function to edit a task
  refreshTasks,           // Function to refresh tasks
  changeView,             // Function to change view (all, today, upcoming)
  stats,                  // Dashboard stats
} = useTasks({
  initialParams: {        // Initial fetch parameters
    page: 1,
    limit: 10,
  },
  autoFetch: true,        // Whether to fetch tasks automatically on mount
  view: 'all',            // Initial view (all, today, upcoming)
});
```

#### `useTasksFilters`

Manages tasks filtering, sorting, and search functionality.

```tsx
const {
  search,                     // Search query
  sortBy,                     // Current sort type
  statusFilter,               // Current status filter
  priorityFilter,             // Current priority filter
  handleSearchChange,         // Function to handle search change
  handleSearchClear,          // Function to clear search
  handleSortChange,           // Function to handle sort change
  handleStatusFilterChange,   // Function to handle status filter change
  handlePriorityFilterChange, // Function to handle priority filter change
  handleClearFilters,         // Function to clear all filters
  filterTasks,                // Function to filter tasks client-side
} = useTasksFilters({
  onFilter,                   // Function to call when filters change (for server-side filtering)
  onSort,                     // Function to call when sort changes
  clientSideFiltering: true,  // Whether to filter client-side
});
```

## Components

- `TasksList`: Main component that combines all other components
- `TaskItem`: Component for rendering a single task
- `TasksListLayout`: Layout component using render props pattern
- `TasksSearch`: Search component
- `TasksSort`: Sort component
- `TasksFilter`: Filter component

## API

The component uses the `tasksApi` service for data fetching:

- `getTasks`: Get tasks with filtering, sorting, and pagination
- `getTaskById`: Get a task by ID
- `createTask`: Create a new task
- `updateTask`: Update a task
- `deleteTask`: Delete a task
- `toggleTaskCompletion`: Toggle task completion status
- `getTodayTasks`: Get today's tasks
- `getUpcomingTasks`: Get upcoming tasks
- `getDashboardStats`: Get dashboard statistics

## Backend API Alignment

The component is designed to work with the backend API endpoints defined in `todo-controller.ts`:

- `GET /todos`: Get all todos with pagination, sorting, and filtering
- `GET /todos/:id`: Get a todo by ID
- `POST /todos`: Create a new todo
- `PATCH /todos/:id`: Update an existing todo
- `DELETE /todos/:id`: Delete a todo by ID
- `POST /todos/:id/toggle`: Toggle todo completion status
- `GET /todos/today`: Get today's todos
- `GET /todos/upcoming`: Get upcoming todos
- `GET /todos/dashboard`: Get dashboard stats

## Next.js Integration

The `TasksList` component can be easily integrated into a Next.js application using the provided hooks and components. Here's an example of how to use it in a Next.js app:

```tsx
'use client';

import { 
  TasksList, 
  TasksListLayout, 
  TasksSearch, 
  TasksSort, 
  TasksFilter,
  useTasks,
  useTasksFilters
} from '@/features/tasks-list';

export default function TasksPage() {
  // Use the custom hooks for state management
  const { tasks, isLoading, error, refreshTasks, toggleTaskCompletion, deleteTask } = useTasks();
  const { currentView, setView, taskStats } = useTasksFilters({ onFilter: refreshTasks });

  return (
    <div className="container mx-auto p-4">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div onClick={() => setView('all')}>
          <h3>All Tasks</h3>
          <p>{taskStats.all}</p>
        </div>
        {/* Other stat cards */}
      </div>

      {/* Tasks List with Layout */}
      <TasksListLayout
        header={/* Search and filters */}
        content={
          <TasksList
            tasks={tasks}
            onToggleComplete={toggleTaskCompletion}
            onDelete={deleteTask}
            onEdit={() => {}}
            isLoading={isLoading}
            error={error}
          />
        }
      />
    </div>
  );
}
```

For a complete example, see the `example-next-app.tsx` file.

### Server Components Support

While the main `TasksList` component requires client-side JavaScript, you can implement a hybrid approach:

1. Use React Server Components to fetch initial data
2. Pass the data to client components for interactivity

```tsx
// page.tsx (Server Component)
import { TasksPageClient } from './tasks-page-client';
import { fetchInitialTasks } from '@/lib/data';

export default async function TasksPage() {
  // Fetch data on the server
  const initialTasks = await fetchInitialTasks();
  
  // Pass to client component
  return <TasksPageClient initialTasks={initialTasks} />;
}
```

```tsx
// tasks-page-client.tsx (Client Component)
'use client';

import { TasksList, useTasks } from '@/features/tasks-list';

export function TasksPageClient({ initialTasks }) {
  // Initialize with server-fetched data
  const { tasks, isLoading, error } = useTasks({ 
    initialTasks,
    skipInitialFetch: true 
  });
  
  return (
    <TasksList
      tasks={tasks}
      isLoading={isLoading}
      error={error}
      // ... other props
    />
  );
}
```

This approach combines the benefits of server-side rendering with client-side interactivity. 