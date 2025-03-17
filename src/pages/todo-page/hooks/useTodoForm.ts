'use client';

import { useState } from 'react';
import { TodoItem } from '../../../widgets/todo-list/types';

interface UseTodoFormReturn {
  isFormOpen: boolean;
  editingTodo: TodoItem | null;
  openForm: () => void;
  closeForm: () => void;
  setEditingTodo: (todo: TodoItem | null) => void;
}

/**
 * Custom hook to manage the todo form state
 */
export function useTodoForm(): UseTodoFormReturn {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };

  return {
    isFormOpen,
    editingTodo,
    openForm,
    closeForm,
    setEditingTodo
  };
} 