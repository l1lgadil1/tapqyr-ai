import { OpenAI } from 'openai';
import config from '../config';
import logger from '../utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Configure the assistant with the necessary tools/functions
 */
async function configureAssistant() {
  try {
    const assistantId = config.openai.assistantId;
    
    if (!assistantId) {
      logger.error('Assistant ID not found in configuration');
      return;
    }
    
    logger.info(`Configuring assistant ${assistantId} with task management functions`);
    
    // Get the current assistant configuration
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    // Define the functions for task management
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "create_task",
          description: "Create a new task for the user",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "The title of the task"
              },
              description: {
                type: "string",
                description: "Optional detailed description of the task"
              },
              priority: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Priority level of the task"
              },
              dueDate: {
                type: "string",
                description: "Due date in ISO format (YYYY-MM-DD)"
              }
            },
            required: ["title"]
          }
        }
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
                description: "ID of the task to update"
              },
              title: {
                type: "string",
                description: "New title for the task"
              },
              description: {
                type: "string",
                description: "New description for the task"
              },
              priority: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "New priority level"
              },
              dueDate: {
                type: "string",
                description: "New due date in ISO format (YYYY-MM-DD)"
              },
              completed: {
                type: "boolean",
                description: "Mark task as completed or not"
              }
            },
            required: ["taskId"]
          }
        }
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
                description: "ID of the task to delete"
              }
            },
            required: ["taskId"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "get_tasks",
          description: "Get tasks with optional filtering",
          parameters: {
            type: "object",
            properties: {
              priority: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Filter by priority"
              },
              completed: {
                type: "boolean",
                description: "Filter by completion status"
              },
              dueBefore: {
                type: "string",
                description: "Filter by due date before this date (YYYY-MM-DD)"
              },
              dueAfter: {
                type: "string",
                description: "Filter by due date after this date (YYYY-MM-DD)"
              }
            }
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "analyze_productivity",
          description: "Analyze user productivity",
          parameters: {
            type: "object",
            properties: {
              startDate: {
                type: "string",
                description: "Start date for the analysis period (YYYY-MM-DD)"
              },
              endDate: {
                type: "string",
                description: "End date for the analysis period (YYYY-MM-DD)"
              }
            }
          }
        }
      }
    ];
    
    // Update the assistant with the tools
    const updatedAssistant = await openai.beta.assistants.update(assistantId, {
      tools: tools,
      instructions: `You are a helpful task management assistant. 
You can help users manage their tasks and analyze their productivity.

IMPORTANT: When users ask you to create tasks, ALWAYS use the create_task function. This is essential as users need to see the tasks in their task list.
Examples of when to create tasks:
- User asks "Create a task to buy groceries"
- User says "I need to finish my report by Friday"
- User mentions "Remind me to call mom tomorrow"

For task creation requests that are clear and specific, directly create the task without asking for confirmation.
For vague requests, ask clarifying questions to get necessary details.

When you create a task, tell the user that it has been added to their task list and they can view it there.

Always prioritize helping users stay organized and productive.`
    });
    
    logger.info('Assistant successfully updated with task management functions');
    logger.info(`Assistant name: ${updatedAssistant.name}`);
    logger.info(`Function count: ${updatedAssistant.tools.length}`);
    
    return updatedAssistant;
  } catch (error) {
    logger.error('Error configuring assistant:', error);
    throw error;
  }
}

export default configureAssistant;

// Execute the configuration if this script is run directly
if (require.main === module) {
  configureAssistant()
    .then(() => {
      logger.info('Assistant configuration completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Assistant configuration failed', error);
      process.exit(1);
    });
} 