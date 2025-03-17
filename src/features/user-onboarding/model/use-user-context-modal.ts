import { useState, useCallback, useEffect } from 'react';
import { useUserOnboardingStore } from './store';

/**
 * Hook to manage the user context modal state
 * @returns Object with modal state and functions to open/close the modal
 */
export const useUserContextModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isOnboardingComplete, 
    workDescription, 
    shortTermGoals, 
    longTermGoals, 
    otherContext,
    userId,
    loadUserContext
  } = useUserOnboardingStore();
  
  // Check if user has any context data
  const hasContext = !!(workDescription || shortTermGoals || longTermGoals || otherContext);
  
  // Only show context modal if onboarding is complete and user has context
  const canShowContextModal = isOnboardingComplete && hasContext;
  
  // Debug logging
  useEffect(() => {
    console.log('useUserContextModal: isOnboardingComplete =', isOnboardingComplete);
    console.log('useUserContextModal: hasContext =', hasContext);
    console.log('useUserContextModal: canShowContextModal =', canShowContextModal);
    console.log('useUserContextModal: context data =', {
      workDescription,
      shortTermGoals,
      longTermGoals,
      otherContext
    });
  }, [isOnboardingComplete, hasContext, canShowContextModal, workDescription, shortTermGoals, longTermGoals, otherContext]);
  
  // Refresh context data when modal is opened
  useEffect(() => {
    if (isOpen && userId) {
      console.log('useUserContextModal: Modal opened, refreshing context data');
      loadUserContext().catch(error => {
        console.error('Error loading user context in modal:', error);
      });
    }
  }, [isOpen, userId, loadUserContext]);
  
  // Close modal if context becomes unavailable
  useEffect(() => {
    if (isOpen && !canShowContextModal) {
      console.log('useUserContextModal: Context no longer available, closing modal');
      setIsOpen(false);
    }
  }, [isOpen, canShowContextModal]);
  
  const openModal = useCallback(async () => {
    console.log('openModal called, canShowContextModal =', canShowContextModal);
    
    if (userId) {
      try {
        // Refresh context data before opening modal
        await loadUserContext();
        
        // Check again if we can show the modal after refreshing data
        if (isOnboardingComplete && (workDescription || shortTermGoals || longTermGoals || otherContext)) {
          console.log('useUserContextModal: Context available, opening modal');
          setIsOpen(true);
        } else {
          console.log('useUserContextModal: No context available after refresh');
        }
      } catch (error) {
        console.error('Error loading context before opening modal:', error);
      }
    } else if (canShowContextModal) {
      // If no userId but we have context data locally
      setIsOpen(true);
    }
  }, [canShowContextModal, userId, loadUserContext, isOnboardingComplete, workDescription, shortTermGoals, longTermGoals, otherContext]);
  
  const closeModal = useCallback(() => {
    console.log('closeModal called');
    setIsOpen(false);
  }, []);
  
  return {
    isOpen,
    setIsOpen,
    openModal,
    closeModal,
    canShowContextModal,
    hasContext
  };
}; 