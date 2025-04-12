/**
 * Get the current auth token from localStorage
 */
function getAuthToken(): string | null {
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

// Types for pending function calls
export interface PendingFunctionCall {
  id: string;
  userId: string;
  threadId: string;
  runId: string;
  functionName: string;
  functionArgs: string;
  toolCallId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  formattedArgs?: Record<string, unknown>;
}

export interface ApproveCallResponse {
  success: boolean;
  message: string;
  result: unknown;
}

export interface RejectCallResponse {
  success: boolean;
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
 * Get pending function calls that require user approval
 */
export async function getPendingFunctionCalls(): Promise<PendingFunctionCall[]> {
  const token = getAuthToken();
  
  if (!token) {
    dispatchAuthError('Authentication required');
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/assistant/pending-calls`, {
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
    console.error('Error fetching pending function calls:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Approve a pending function call
 */
export async function approveFunctionCall(callId: string): Promise<ApproveCallResponse> {
  const token = getAuthToken();
  
  if (!token) {
    dispatchAuthError('Authentication required');
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/assistant/pending-calls/${callId}/approve`, {
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
    console.error('Error approving function call:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Reject a pending function call
 */
export async function rejectFunctionCall(callId: string): Promise<RejectCallResponse> {
  const token = getAuthToken();
  
  if (!token) {
    dispatchAuthError('Authentication required');
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/assistant/pending-calls/${callId}/reject`, {
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
    console.error('Error rejecting function call:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
} 