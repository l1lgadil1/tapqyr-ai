import { assistantApiClient } from './api-client';

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

/**
 * Get pending function calls that require user approval
 */
export async function getPendingFunctionCalls(): Promise<PendingFunctionCall[]> {
  try {
    const response = await assistantApiClient.get('/assistant/pending-calls');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending function calls:', error);
    throw error;
  }
}

/**
 * Approve a pending function call
 */
export async function approveFunctionCall(callId: string): Promise<ApproveCallResponse> {
  try {
    const response = await assistantApiClient.post(`/assistant/pending-calls/${callId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving function call:', error);
    throw error;
  }
}

/**
 * Reject a pending function call
 */
export async function rejectFunctionCall(callId: string): Promise<RejectCallResponse> {
  try {
    const response = await assistantApiClient.post(`/assistant/pending-calls/${callId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting function call:', error);
    throw error;
  }
} 