import { useState } from 'react';
import { TaskListExample, FloatingActionButton } from "../../../features/tasks-list";
import { TaskEditDialog } from "../../../features/tasks-list/ui/task-edit-dialog";
import { tasksApi } from "../../../features/tasks-list/model/api";
import { Task } from "../../../features/tasks-list/model/types";
import { NavigationTabs } from '../../../widgets/navigation-tabs/ui/navigation-tabs';
import { Tabs, TabsContent } from "../../../shared/ui/tabs/tabs";

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
      <Tabs defaultValue="todos" className="w-full">
          <NavigationTabs />
          <TabsContent value="todos" className="mt-6">
            <TaskListExample key={refreshKey} />
          </TabsContent>
          <FloatingActionButton onClick={handleAddTask} />
          <TaskEditDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              task={null}
              onSave={handleSaveTask}
          />
      </Tabs>
  );
}