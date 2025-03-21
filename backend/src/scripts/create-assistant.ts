import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { OpenAI } from 'openai';
import config from '../config';
import logger from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Assistant configuration
const ASSISTANT_CONFIG = {
  name: "Task Management Assistant",
  model: "gpt-4o", // Latest model for best performance
  description: "An assistant that helps manage tasks, analyze productivity, and provide recommendations.",
  instructions: `
    You are a task management assistant designed to help users organize their work, manage tasks, and improve productivity.
    
    Your capabilities include:
    1. Managing tasks (creating, updating, deleting, prioritizing)
    2. Analyzing productivity patterns and providing insights
    3. Generating tasks based on user descriptions or goals
    4. Setting reminders and deadlines
    5. Categorizing tasks automatically
    6. Providing recommendations to improve work efficiency
    
    When interacting with users:
    - Be concise and clear
    - Always confirm task creation, updates, or deletions
    - Ask for clarification if a request is ambiguous
    - Provide helpful suggestions based on the user's work patterns
    - Be supportive and encouraging
    
    When handling tasks:
    - Properly prioritize tasks (high, medium, low)
    - Set reasonable deadlines when requested
    - Suggest breaking down large tasks into smaller ones
    - Help users focus on important and urgent tasks first
  `,
  tools: [
    {
      type: "function" as const,
      function: {
        name: "create_task",
        description: "Create a new task",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the task",
            },
            description: {
              type: "string",
              description: "The description of the task",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "The priority level of the task",
            },
            dueDate: {
              type: "string",
              description: "The due date of the task in ISO format (YYYY-MM-DD)",
            },
          },
          required: ["title"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "update_task",
        description: "Update an existing task",
        parameters: {
          type: "object",
          properties: {
            taskId: {
              type: "string",
              description: "The ID of the task to update",
            },
            title: {
              type: "string",
              description: "The updated title of the task",
            },
            description: {
              type: "string",
              description: "The updated description of the task",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "The updated priority level of the task",
            },
            dueDate: {
              type: "string",
              description: "The updated due date of the task in ISO format (YYYY-MM-DD)",
            },
            completed: {
              type: "boolean",
              description: "Whether the task is completed",
            },
          },
          required: ["taskId"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "delete_task",
        description: "Delete a task",
        parameters: {
          type: "object",
          properties: {
            taskId: {
              type: "string",
              description: "The ID of the task to delete",
            },
          },
          required: ["taskId"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "get_tasks",
        description: "Get user tasks with optional filtering",
        parameters: {
          type: "object",
          properties: {
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Filter tasks by priority",
            },
            completed: {
              type: "boolean",
              description: "Filter tasks by completion status",
            },
            dueBefore: {
              type: "string",
              description: "Get tasks due before this date (YYYY-MM-DD)",
            },
            dueAfter: {
              type: "string",
              description: "Get tasks due after this date (YYYY-MM-DD)",
            },
          },
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "analyze_productivity",
        description: "Analyze user productivity based on task completion data",
        parameters: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              description: "Start date for analysis period (YYYY-MM-DD)",
            },
            endDate: {
              type: "string",
              description: "End date for analysis period (YYYY-MM-DD)",
            },
          },
        },
      },
    },
  ],
};

async function createAssistant() {
  try {
    logger.info("Creating new OpenAI Assistant...");
    
    // Create the assistant
    const assistant = await openai.beta.assistants.create(ASSISTANT_CONFIG);
    
    logger.info(`Assistant created successfully with ID: ${assistant.id}`);
    
    // Update the .env file with the new assistant ID
    const envFilePath = path.resolve(__dirname, '../../.env');
    const envFileContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Replace the existing assistant ID or add a new one if it doesn't exist
    const updatedEnvContent = envFileContent.includes('OPENAI_ASSISTANT_ID=')
      ? envFileContent.replace(/OPENAI_ASSISTANT_ID=.*/g, `OPENAI_ASSISTANT_ID=${assistant.id}`)
      : `${envFileContent}\nOPENAI_ASSISTANT_ID=${assistant.id}`;
    
    fs.writeFileSync(envFilePath, updatedEnvContent);
    
    logger.info(`Updated .env file with new assistant ID`);
    logger.info("Assistant creation completed successfully");
    
    return assistant.id;
  } catch (error) {
    logger.error(`Failed to create assistant: ${(error as Error).message}`);
    throw error;
  }
}

// Execute the function if this file is run directly
if (require.main === module) {
  createAssistant()
    .then((assistantId) => {
      logger.info(`Assistant created with ID: ${assistantId}`);
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Error creating assistant: ${error.message}`);
      process.exit(1);
    });
}

export { createAssistant }; 