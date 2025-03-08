# AI Todo List Backend

This is the backend service for the AI-powered Todo List application. It provides an API for integrating with OpenAI to generate tasks and completions.

## Features

- Express.js server with TypeScript
- OpenAI API integration
- Task generation from natural language prompts
- Structured JSON responses
- Error handling and logging
- CORS and security headers

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

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

## Environment Variables

- `PORT`: The port the server will run on (default: 3001)
- `NODE_ENV`: The environment (development, production)
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: The OpenAI model to use (default: gpt-4-turbo)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
- `LOG_LEVEL`: Logging level (default: info)

## License

MIT 