# AI Assistant Feature

This feature provides an AI-powered assistant that helps users manage tasks, analyze productivity, and get recommendations.

## Features

- Chat interface for interacting with the AI assistant
- Create tasks through natural language
- Analyze productivity and get recommendations
- Generate tasks based on prompts

## Implementation

The AI assistant implements the following components:

1. **API Layer**: Handles communication with the backend
2. **State Management**: Uses Zustand store to manage messages and state
3. **UI Components**: Chat interface for user interaction

## Getting Started

### Prerequisites

- Backend API running with OpenAI API key configured
- User authentication set up

### Usage

The AI assistant is available through:

1. The dedicated `/ai-assistant` page
2. The sidebar assistant component

### Configuration

To enable the AI assistant, you need to:

1. Set up the backend assistant by running:
   ```
   cd backend
   npm run create-assistant
   ```
   This creates the OpenAI assistant and updates your `.env` file.

2. Ensure your OpenAI API key is valid and has access to the Assistant API.

### Fallback Mode

If the OpenAI Assistant ID is not configured, the system will run in fallback mode:
- It will generate mock responses
- Create tasks locally
- Provide basic functionality without API calls

## API

The assistant exposes the following methods:

- `sendChatMessage(message, threadId)`: Send a message to the assistant
- `createThread()`: Create a new conversation thread
- `generateTasks(prompt)`: Generate tasks based on a prompt
- `analyzeProductivity()`: Analyze user productivity and get recommendations

## Troubleshooting

If you encounter issues:

1. Check that the backend server is running
2. Verify the OpenAI API key is valid
3. Ensure the user is authenticated
4. Check browser console for errors 