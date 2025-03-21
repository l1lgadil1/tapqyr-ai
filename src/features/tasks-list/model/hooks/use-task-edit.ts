import { useState, useCallback } from 'react';
import { Task } from '../types';
import { tasksApi } from '../api';

export interface UseTaskEditOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseTaskEditReturn {
  selectedTask: Task | null;
  isDialogOpen: boolean;
  isUpdating: boolean;
  error: string | null;
  selectTaskForEdit: (task: Task) => void;
  closeDialog: () => void;
  updateTask: (taskData: Partial<Task>) => Promise<void>;
}

export function useTaskEdit({
  onSuccess,
  onError,
}: UseTaskEditOptions = {}): UseTaskEditReturn {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectTaskForEdit = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
    setError(null);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    // Clear the selected task after a short delay to allow for exit animations
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  }, []);

  const updateTask = useCallback(
    async (taskData: Partial<Task>) => {
      if (!selectedTask) {
        setError('No task selected for editing');
        return;
      }

      try {
        setIsUpdating(true);
        setError(null);

        // Ensure we have the task ID
        const updatedTaskData = {
          ...taskData,
          id: selectedTask.id,
        };

        // Call the API to update the task
        await tasksApi.updateTask(selectedTask.id, updatedTaskData);

        // Close the dialog on success
        setIsDialogOpen(false);
        
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
        setError(errorMessage);
        
        // Call the error callback if provided
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedTask, onSuccess, onError]
  );

  return {
    selectedTask,
    isDialogOpen,
    isUpdating,
    error,
    selectTaskForEdit,
    closeDialog,
    updateTask,
  };
} 