export type Priority = 'high' | 'medium' | 'low';

export interface Subtask {
  title: string;
  description: string;
  completed?: boolean;
}

export interface Task {
  title: string;
  description: string;
  priority: Priority;
  estimatedTime: string;
  completed?: boolean;
  subtasks?: Subtask[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskGenerationResponse {
  tasks: Task[];
} 