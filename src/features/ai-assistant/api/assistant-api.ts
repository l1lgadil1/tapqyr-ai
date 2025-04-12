// Auth functions implemented directly to avoid import issues
// import { getAuthToken } from '../../../shared/lib/auth';

/**
 * Get the current auth token from localStorage
 */
function getAuthToken(): string | null {
  // Check both potential token keys for backward compatibility
  return localStorage.getItem('token') || localStorage.getItem('authToken');
}

// Helper to dispatch authentication errors
function dispatchAuthError(message: string) {
  const authErrorEvent = new CustomEvent('auth-error', {
    detail: {
      message: message || 'Authentication required. Please log in again.',
      statusCode: 401
    }
  });
  window.dispatchEvent(authErrorEvent);
}

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
  threadId: string;
  message: string;
  response: AssistantResponseData;
}

export interface ProductivityAnalysis {
  analysis: string;
  message: string;
}

// API base URL configuration
const API_BASE_URL = '/api';

/**
 * Safely parse error responses
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.message || data.error || 'Unknown error occurred';
  } catch {
    return `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
  }
}

/**
 * Send a message to the AI assistant
 * @param message The user's message
 * @param threadId Optional thread ID for continuing a conversation
 */
export async function sendChatMessage(message: string, threadId?: string): Promise<AssistantResponse> {
  const token = getAuthToken();
  
  if (!token) {
    dispatchAuthError('Authentication required');
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, threadId }),
    });
    
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      if (response.status === 401) {
        dispatchAuthError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Create a new conversation thread
 */
export async function createThread(): Promise<{ threadId: string; message: string }> {
  const token = getAuthToken();
  
  if (!token) {
    dispatchAuthError('Authentication required');
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/assistant/thread`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      if (response.status === 401) {
        dispatchAuthError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Generate tasks based on a prompt
 * @param prompt The prompt describing the tasks to generate
 */
export async function generateTasks(prompt: string): Promise<{ message: string }> {
  const token = getAuthToken();
  
  if (!token) {
    dispatchAuthError('Authentication required');
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/assistant/generate-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      if (response.status === 401) {
        dispatchAuthError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Analyze user productivity
 */
export async function analyzeProductivity(): Promise<ProductivityAnalysis> {
  const token = getAuthToken();
  
  if (!token) {
    dispatchAuthError('Authentication required');
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/assistant/analyze-productivity`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      if (response.status === 401) {
        dispatchAuthError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error analyzing productivity:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
} 