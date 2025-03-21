"use client";

import { useEffect, useState } from "react";
import { UserContext, UpdateUserContextRequest } from "../../../shared/api/types/user";
import { userApiService } from "../../../shared/api/api-service";

const STORAGE_KEY = "contextModalDismissed";

export function useUserContextModal(userId: string) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const apiService = userApiService;

  const isContextEmpty = !userContext?.workDescription && 
    !userContext?.shortTermGoals && 
    !userContext?.longTermGoals && 
    !userContext?.otherContext;

  const loadUserContext = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getUserContext(userId);
      console.log('User context:', data)
      setUserContext(data);
      
      // Check if we should open the modal automatically
      const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
      
      if (isContextEmpty && !isDismissed) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to load user context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserContext = async (data: UpdateUserContextRequest) => {
    try {
      const updatedData = await apiService.updateUserContext(userId, data);
      setUserContext(updatedData);
    } catch (error) {
      console.error("Failed to update user context:", error);
      throw error;
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    
    // If the context is empty, mark as dismissed
    if (isContextEmpty) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  // Load user context on mount
  useEffect(() => {
    if (userId) {
      loadUserContext();
    }
  }, [userId]);

  return {
    isModalOpen,
    userContext,
    isLoading,
    isContextEmpty,
    openModal,
    closeModal,
    updateUserContext,
    loadUserContext,
  };
} 