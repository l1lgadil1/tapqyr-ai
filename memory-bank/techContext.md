# Technical Context: TapqyrAI

## Technologies Used

### Frontend Technologies

#### Core Framework and Language
- **React 18**: Modern UI library for building component-based interfaces
- **TypeScript**: Strongly-typed JavaScript for improved developer experience and code quality
- **Vite**: Fast, modern frontend build tool and development server

#### State Management
- **Zustand**: Lightweight state management library with a simple API
- **React Query**: Data fetching and caching library for API interactions

#### Routing
- **React Router**: Client-side routing library for single-page applications

#### UI Components and Styling
- **Radix UI**: Unstyled, accessible component primitives
- **ShadCN UI**: Component collection built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Library for creating variant-aware components
- **tailwind-merge**: Utility for merging Tailwind CSS classes

#### 3D Visualization
- **Three.js**: JavaScript 3D library for creating WebGL-based visualizations
- **React Three Fiber**: React renderer for Three.js
- **React Spring Three**: Animation library for Three.js in React
- **Drei**: Useful helpers for React Three Fiber
- **Postprocessing**: Effects library for Three.js

#### Internationalization
- **i18next**: Internationalization framework
- **react-i18next**: React bindings for i18next

#### Other Frontend Libraries
- **Zod**: TypeScript-first schema validation
- **date-fns**: Date utility library
- **Framer Motion**: Animation library for React
- **Lucide React**: Icon library
- **React Helmet Async**: Document head manager for React

### Backend Technologies

#### Framework and Language
- **NestJS**: Progressive Node.js framework for building server-side applications
- **TypeScript**: Type-safe language for backend development
- **Express**: Web framework for Node.js (used by NestJS)

#### Database
- **PostgreSQL**: Relational database for storing application data
- **Prisma ORM**: Next-generation ORM for Node.js and TypeScript

#### Authentication
- **JSON Web Tokens (JWT)**: Token-based authentication mechanism
- **bcrypt**: Password hashing library for secure storage

#### AI Integration
- **OpenAI API**: External API for AI capabilities
- **GPT-4**: Large language model for natural language processing

#### Logging and Monitoring
- **Winston**: Logging library for Node.js
- **Morgan**: HTTP request logger middleware for Node.js

#### Other Backend Libraries
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing middleware
- **helmet**: HTTP security middleware

## Development Setup

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 15.x or higher

### Environment Variables

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_AUTH_STORAGE_KEY=tapqyr_auth
```

#### Backend (.env)
```
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tapqyr_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### Local Development Workflow

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Full Stack Development**:
   ```bash
   npm run dev:all   # Runs both frontend and backend concurrently
   ```

## Technical Constraints

### Performance Constraints
- OpenAI API has rate limits that must be considered for AI features
- 3D visualizations should be optimized for performance on lower-end devices
- Initial page load time should be under 3 seconds

### Security Constraints
- User authentication must use industry-standard security practices
- API endpoints must be protected against common vulnerabilities
- User data must be properly sanitized before storage

### Browser Compatibility
- Application should support the latest two versions of major browsers
- Progressive enhancement for older browsers
- Mobile-first responsive design

## Dependencies and External Services

### Runtime Dependencies
The application relies on several external services:
- **PostgreSQL Database**: For data persistence
- **OpenAI API**: For AI capabilities
- **Email Service**: For notifications and account management (not yet implemented)

### Development Dependencies
- **TypeScript**: Type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Concurrently**: Running multiple processes

## Deployment Architecture

The application is designed to be deployed in a modern cloud environment:

```
┌─────────────────┐     ┌────────────────┐      ┌──────────────┐
│                 │     │                │      │              │
│  CDN / Edge     │────▶│  Frontend      │      │  Database    │
│  (Static Files) │     │  (Vite Build)  │      │  (PostgreSQL)│
│                 │     │                │      │              │
└─────────────────┘     └────────────────┘      └──────────────┘
                               │                       ▲
                               ▼                       │
                        ┌────────────────┐             │
                        │                │             │
                        │  Backend API   │─────────────┘
                        │  (NestJS)      │
                        │                │
                        └────────────────┘
                               │
                               ▼
                        ┌────────────────┐
                        │                │
                        │  OpenAI API    │
                        │                │
                        └────────────────┘
```

This architecture ensures:
- Scalability through horizontal scaling of API servers
- Performance through CDN distribution of static assets
- Reliability through managed database services
- Security through proper network isolation 