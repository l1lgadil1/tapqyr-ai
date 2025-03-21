/**
 * Get pending function calls that require user approval
 */
export const getPendingFunctionCalls = async (): Promise<any[]> => {
  try {
    const response = await api.get('/assistant/pending-calls');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending function calls:', error);
    throw error;
  }
};

/**
 * Approve a pending function call
 */
export const approveFunctionCall = async (callId: string): Promise<any> => {
  try {
    const response = await api.post(`/assistant/pending-calls/${callId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving function call:', error);
    throw error;
  }
};

/**
 * Reject a pending function call
 */
export const rejectFunctionCall = async (callId: string): Promise<any> => {
  try {
    const response = await api.post(`/assistant/pending-calls/${callId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting function call:', error);
    throw error;
  }
}; 