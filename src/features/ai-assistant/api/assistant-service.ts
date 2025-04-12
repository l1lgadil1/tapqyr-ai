import { assistantApiClient } from './api-client';

// Types for API communication
export interface Message {
  content: string;
  role: 'user' | 'assistant';
}

export interface MessageContent {
  type: string;
  text?: {
    value: string;
  };
}

export interface AssistantResponseData {
  id: string;
  role: 'assistant';
  content: MessageContent[];
  created_at: number;
}

export interface AssistantResponse {
  message: string;
  response: AssistantResponseData;
}

export interface ProductivityAnalysis {
  analysis: string;
  message: string;
}

/**
 * Send a message to the AI assistant
 * @param message The user's message
 */
export async function sendChatMessage(message: string): Promise<AssistantResponse> {
  try {
    const response = await assistantApiClient.post('/assistant/chat', { message });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Create a new conversation thread
 */
export async function createThread(): Promise<{ threadId: string; message: string }> {
  try {
    const response = await assistantApiClient.post('/assistant/thread');
    return response.data;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

/**
 * Generate tasks based on a prompt
 * @param prompt The prompt describing the tasks to generate
 */
export async function generateTasks(prompt: string): Promise<{ message: string }> {
  try {
    const response = await assistantApiClient.post('/assistant/generate-tasks', { prompt });
    return response.data;
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw error;
  }
}

/**
 * Analyze user productivity
 */
export async function analyzeProductivity(): Promise<ProductivityAnalysis> {
  try {
    const response = await assistantApiClient.get('/assistant/analyze-productivity');
    return response.data;
  } catch (error) {
    console.error('Error analyzing productivity:', error);
    throw error;
  }
} 