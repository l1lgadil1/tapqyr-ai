# Backend Scripts

This directory contains utility scripts for the backend.

## Create OpenAI Assistant

The `create-assistant.ts` script creates a new OpenAI Assistant and updates the `.env` file with the assistant ID.

### Usage

Run the script using npm:

```bash
npm run create-assistant
```

This will:

1. Create a new OpenAI Assistant with the specified configuration
2. Log the assistant ID to the console
3. Update the `.env` file with the new assistant ID

### Configuration

The assistant is configured with:

- Name: "Task Management Assistant"
- Model: gpt-4o
- Tools: code_interpreter and function calling for task management
- Custom instructions for task management

### Requirements

- Valid OpenAI API key in the `.env` file
- OpenAI API access with Assistant API capabilities

### Troubleshooting

If you encounter any issues:

1. Ensure your OpenAI API key is valid and has access to the Assistant API
2. Check that you have sufficient quota for creating assistants
3. Verify that the `.env` file is accessible and writable 