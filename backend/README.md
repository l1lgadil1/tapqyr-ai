# AI Todo List Backend

This is the backend service for the AI-powered Todo List application. It provides an API for integrating with OpenAI to generate tasks and completions.

## Features

- Express.js server with TypeScript
- OpenAI API integration
- OpenAI Assistant API for conversational task management
- Task generation from natural language prompts
- Structured JSON responses
- Error handling and logging
- CORS and security headers

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key with access to the Assistants API

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
6. Create an OpenAI Assistant:
   ```
   npm run create-assistant
   ```
   This will create a new OpenAI Assistant and update your `.env` file with the assistant ID.

### Development

To start the development server:

```
npm run dev
```

or

```
yarn dev
```

The server will start on port 3001 (or the port specified in your `.env` file).

### Building for Production

To build the application for production:

```
npm run build
```

or

```
yarn build
```

This will create a `dist` directory with the compiled JavaScript files.

### Running in Production

To run the application in production:

```
npm start
```

or

```
yarn start
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the status of the server.

### Generate Completion

```
POST /api/openai/completion
```

Body:
```json
{
  "prompt": "Your prompt here"
}
```

Returns a text completion based on the prompt.

### Generate Tasks

```
POST /api/openai/tasks
```

Body:
```json
{
  "prompt": "I want to learn programming"
}
```

Returns a structured list of tasks based on the prompt.

### Process Assistant Message

```
POST /api/openai/assistant
```

Body:
```json
{
  "message": "Create a task to learn React",
  "threadId": "optional_thread_id_for_continuing_conversation"
}
```

Returns the assistant's response and a thread ID for continuing the conversation.

## Environment Variables

- `PORT`: The port the server will run on (default: 3001)
- `NODE_ENV`: The environment (development, production)
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: The OpenAI model to use (default: gpt-4-turbo)
- `OPENAI_ASSISTANT_ID`: The ID of your OpenAI Assistant
- `DATABASE_URL`: The URL for your database connection (default: "file:../prisma/dev.db" for SQLite)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
- `LOG_LEVEL`: Logging level (default: info)

## License

MIT