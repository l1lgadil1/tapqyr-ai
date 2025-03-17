# Todo Page Implementations

This directory contains different implementations of the Todo page using various approaches and component architectures.

## Implementations

### 1. Original Implementation (`TodoPage`)

The original implementation uses a custom hook (`useTodos`) and the `TodoList` widget to display and manage tasks.

**Key features:**
- Custom hooks for data fetching and state management
- Infinite scrolling with intersection observer
- Basic filtering and sorting

### 2. Feature-Sliced Design Implementation (`TasksPage`)

A modern implementation using the Feature-Sliced Design (FSD) architecture with the `TasksList` component and its associated hooks.

**Key features:**
- Reusable components from the `tasks-list` feature
- Dashboard statistics with completion rate
- View switching between all, today, upcoming, and completed tasks
- Advanced filtering and sorting
- Responsive design with mobile-first approach

### 3. Comparison View (`TodoComparison`)

A page that allows you to compare both implementations side by side.

## Usage

### Basic Usage

```tsx
import { TodoPage } from '@/pages/todo-page';

export default function Page() {
  return <TodoPage />;
}
```

### Using the FSD Implementation

```tsx
import { TasksPage } from '@/pages/todo-page';

export default function Page() {
  return <TasksPage />;
}
```

### Using the Comparison View

```tsx
import { TodoComparison } from '@/pages/todo-page';

export default function Page() {
  return <TodoComparison />;
}
```

## Architecture

The new implementation follows the Feature-Sliced Design (FSD) architecture:

### Layers

- **Pages**: Page components that compose features and widgets
- **Features**: Business logic and UI components for specific features
- **Shared**: Reusable UI components, utilities, and types

### Benefits

- **Modularity**: Each feature is self-contained and can be developed independently
- **Reusability**: Components and hooks can be reused across the application
- **Maintainability**: Clear separation of concerns makes the code easier to maintain
- **Scalability**: The architecture scales well as the application grows

## Components

- `TasksPage`: Main page component that uses the TasksList feature
- `TodoPage`: Original implementation of the Todo page
- `TodoComparison`: Component that allows comparing both implementations

## Hooks

The new implementation uses the following hooks from the `tasks-list` feature:

- `useTasks`: Manages tasks data fetching and state
- `useTasksFilters`: Manages filtering, sorting, and view switching

## Customization

You can customize the appearance and behavior of the TasksPage by modifying the props passed to the TasksList component and its associated hooks. 