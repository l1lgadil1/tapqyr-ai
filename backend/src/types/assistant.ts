/**
 * Types for assistant actions and responses
 */

export type ActionType = 'create' | 'update' | 'complete' | 'delete' | 'analyze' | 'generate' | 'read' | 'list' | 'filter' | 'search' | 'remind' | 'schedule' | 'prioritize';

export type TaskStatus = 'active' | 'completed' | 'all';

export interface AssistantAction {
  type: ActionType;
  description: string;
  metadata?: Record<string, any>;
}

export interface AssistantResponseWithActions {
  message: string;
  threadId: string;
  response: any;
  actions?: AssistantAction[];
} 