export interface PendingFunctionCall {
  id: string;
  userId: string;
  threadId: string;
  runId: string;
  functionName: string;
  functionArgs: string;
  toolCallId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
} 