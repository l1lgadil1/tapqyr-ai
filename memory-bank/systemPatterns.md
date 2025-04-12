# System Patterns: TapqyrAI

## System Architecture

TapqyrAI follows a modern web application architecture with clearly separated frontend and backend components:

### Frontend Architecture

The frontend follows the **Feature-Sliced Design (FSD)** methodology, which organizes code around business domains and features:

```
frontend/
├── src/
│   ├── app/             # Application initialization, global providers, styles
│   ├── processes/       # Complex multi-step business processes
│   ├── pages/           # Compositional layer combining widgets for specific routes
│   ├── widgets/         # Complex UI blocks combining entities and features
│   ├── features/        # User interactions, business capabilities
│   ├── entities/        # Business entities with data models, API, and UI
│   └── shared/          # Reusable infrastructure code without business logic
```

This architecture provides several benefits:
- Clear separation of concerns
- Improved code organization and navigation
- Better reusability of components
- Easier maintenance and scaling

### Backend Architecture

The backend follows a **modular architecture** based on NestJS principles:

```
backend/
├── src/
│   ├── config/          # Application configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # HTTP request middleware
│   ├── models/          # Data models
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic implementation
│   └── utils/           # Utility functions and helpers
├── prisma/              # Database schema and migrations
└── logs/                # Application logs
```

The backend implements:
- REST API endpoints for CRUD operations
- Authentication middleware using JWT
- Integration with OpenAI API for AI features
- Database operations via Prisma ORM

## Key Technical Decisions

### 1. JWT Authentication

The application uses JSON Web Tokens (JWT) for authentication:
- Tokens are issued upon successful login
- Authentication middleware validates tokens on protected routes
- Token blacklisting for logout functionality
- Optional authentication for certain routes

### 2. State Management with Zustand

Zustand was chosen for state management due to:
- Minimal boilerplate compared to Redux
- Easy integration with React hooks
- Good performance characteristics
- Simple API for creating and consuming stores

### 3. 3D Visualizations with Three.js

Three.js and React Three Fiber are used for 3D elements:
- Visual task representations
- Interactive animations for task completion
- Enhanced user engagement through 3D effects

### 4. Component Library with ShadCN and Radix UI

The UI component strategy:
- Base accessibility-first components from Radix UI
- Styling and extension through ShadCN
- Customization via Tailwind CSS
- Consistent design system implementation

### 5. API Integration with OpenAI

AI capabilities are implemented through:
- Backend proxy to OpenAI API
- Prompt engineering for task generation
- Context-aware AI suggestions
- Smart parsing of AI responses into structured task data

## Design Patterns in Use

### 1. Repository Pattern (Backend)

Database operations are abstracted through repository interfaces, allowing:
- Separation of business logic from data access
- Easier testing through mock repositories
- Potential to switch database implementations

### 2. Factory Pattern (AI Services)

AI service interactions use factory patterns to:
- Create appropriate prompts based on user input
- Handle different types of AI-generated content
- Standardize integration with OpenAI API

### 3. Observer Pattern (Frontend)

Event handling and state updates use observer patterns:
- Reactive UI updates based on state changes
- Event-driven architecture for user interactions
- Subscription-based notification system

### 4. Provider Pattern (React Context)

Global state and services are made available through providers:
- Authentication context for user state
- Theme context for appearance settings
- Toast/notification context for system messages

## Component Relationships

### Data Flow Architecture

```
User Interaction → UI Components → State Management → API Services → Backend API → Database
                                                                   ↓
                                   UI Update ← State Update ← API Response
```

### Authentication Flow

```
Login Form → Auth Service → Backend Auth API → JWT Generation
                                        ↓
           Protected Routes ← JWT Storage ← User Session Creation
```

### AI Task Generation Flow

```
User Prompt → AI Service → Backend Proxy → OpenAI API
                                     ↓
      Task List Update ← Task Creation ← AI Response Processing
```

This architecture ensures clean separation of concerns while maintaining efficient data flow between components. 