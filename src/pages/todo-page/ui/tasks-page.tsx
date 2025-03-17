import { useState } from 'react';
import { TaskListExample, FloatingActionButton } from "../../../features/tasks-list";
import { TaskEditDialog } from "../../../features/tasks-list/ui/task-edit-dialog";
import { tasksApi } from "../../../features/tasks-list/model/api";
import { Task } from "../../../features/tasks-list/model/types";

export function TasksPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddTask = () => {
    setIsDialogOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      await tasksApi.createTask(taskData as Omit<Task, 'id' | 'createdAt'>);
      setIsDialogOpen(false);
      
      // Trigger a refresh of the task list by changing the key
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <>
      <TaskListExample key={refreshKey} />
      <FloatingActionButton onClick={handleAddTask} />
      <TaskEditDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        task={null} 
        onSave={handleSaveTask} 
      />
    </>
  );
}