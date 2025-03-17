# API Module

This module provides a structured approach to API communication in the application.

## Structure

```
api/
├── core/                 # Core API functionality
│   ├── api-client.ts     # Base API client with interceptors
│   ├── api-error.ts      # Custom error handling
│   └── token-storage.ts  # Token management
├── services/             # Service modules by domain
│   ├── auth-service.ts   # Authentication operations
│   ├── todo-service.ts   # Todo operations
│   ├── user-service.ts   # User operations
│   └── index.ts          # Service exports
├── types/                # Type definitions
│   ├── auth.ts           # Auth-related types
│   ├── todo.ts           # Todo-related types
│   ├── user.ts           # User-related types
│   └── index.ts          # Type exports
└── index.ts              # Main entry point
```

## Usage

### Authentication

```typescript
import { authService } from '@/shared/api';

// Login
const user = await authService.login({ 
  email: 'user@example.com', 
  password: 'password' 
});

// Register
await authService.register({ 
  email: 'newuser@example.com', 
  password: 'password',
  name: 'New User'
});

// Logout
await authService.logout();
```

### Todo Operations

```typescript
import { todoService } from '@/shared/api';

// Get todos with filters
const { todos, total } = await todoService.getTodos({
  page: 1,
  limit: 10,
  status: 'active'
});

// Create a todo
const newTodo = await todoService.createTodo({
  title: 'New task',
  description: 'Task description',
  priority: 'high'
});

// Update a todo
await todoService.updateTodo(todoId, {
  title: 'Updated title'
});

// Delete a todo
await todoService.deleteTodo(todoId);
```

### User Operations

```typescript
import { userService } from '@/shared/api';

// Get user context
const userContext = await userService.getUserContext(userId);

// Update user context
await userService.updateUserContext(userId, {
  workDescription: 'Software Developer',
  shortTermGoals: 'Complete current project'
});
```

### Direct API Access

For custom API calls, you can use the apiClient directly:

```typescript
import { apiClient } from '@/shared/api';

// Custom GET request
const data = await apiClient.get('/custom-endpoint');

// Custom POST request
await apiClient.post('/custom-endpoint', { data: 'value' });
```

## Error Handling

All API calls use consistent error handling through the ApiError class:

```typescript
import { authService, ApiError } from '@/shared/api';

try {
  await authService.login({ email: 'user@example.com', password: 'wrong' });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.message}, Status: ${error.statusCode}`);
    // Handle specific error cases
    if (error.statusCode === 401) {
      // Handle unauthorized
    }
  }
}
``` 