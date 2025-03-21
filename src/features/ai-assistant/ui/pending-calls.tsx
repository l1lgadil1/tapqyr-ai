'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from '../../../shared/ui/use-toast';
import { Button } from '../../../shared/ui/button/ui/button';
import { 
  PendingFunctionCall, 
  getPendingFunctionCalls, 
  approveFunctionCall, 
  rejectFunctionCall 
} from '../api/pending-calls-api';

interface PendingCallsProps {
  onUpdate?: () => void;
}

export function PendingCalls({ onUpdate }: PendingCallsProps) {
  const [pendingCalls, setPendingCalls] = useState<PendingFunctionCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchPendingCalls = useCallback(async () => {
    try {
      setLoading(true);
      const calls = await getPendingFunctionCalls();
      setPendingCalls(calls);
    } catch (error) {
      console.error('Failed to fetch pending calls:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load pending function calls',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCalls();
  }, [fetchPendingCalls]);

  const handleApprove = async (callId: string) => {
    setProcessingIds(prev => new Set(prev).add(callId));
    try {
      const response = await approveFunctionCall(callId);
      toast({
        title: 'Function Approved',
        description: response.message || 'Function call has been approved',
      });
      await fetchPendingCalls();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to approve function call:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve function call',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(callId);
        return newSet;
      });
    }
  };

  const handleReject = async (callId: string) => {
    setProcessingIds(prev => new Set(prev).add(callId));
    try {
      const response = await rejectFunctionCall(callId);
      toast({
        title: 'Function Rejected',
        description: response.message || 'Function call has been rejected',
      });
      await fetchPendingCalls();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to reject function call:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject function call',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(callId);
        return newSet;
      });
    }
  };

  const formatArgs = useCallback((args: string) => {
    try {
      const parsedArgs = JSON.parse(args);
      return Object.entries(parsedArgs)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');
    } catch {
      return args;
    }
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading pending function calls...</div>;
  }

  if (pendingCalls.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary/20 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Pending Function Calls</h3>
      <div className="space-y-3">
        {pendingCalls.map((call) => (
          <div key={call.id} className="bg-background rounded-md p-3 shadow-sm">
            <div className="mb-2">
              <span className="font-medium">{call.functionName}</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              <p>Arguments: {formatArgs(call.functionArgs)}</p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => handleApprove(call.id)}
                disabled={processingIds.has(call.id)}
              >
                {processingIds.has(call.id) ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(call.id)}
                disabled={processingIds.has(call.id)}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 