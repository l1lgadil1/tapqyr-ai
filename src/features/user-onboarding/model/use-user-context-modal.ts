import { useState, useCallback, useEffect } from 'react';
import { useUserOnboardingStore } from './store';

/**
 * Hook to manage the user context modal state
 * @returns Object with modal state and functions to open/close the modal
 */
export const useUserContextModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isOnboardingComplete, workDescription, shortTermGoals, longTermGoals, otherContext } = useUserOnboardingStore();
  
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
  
  const openModal = useCallback(() => {
    console.log('openModal called, canShowContextModal =', canShowContextModal);
    if (canShowContextModal) {
      setIsOpen(true);
    }
  }, [canShowContextModal]);
  
  const closeModal = useCallback(() => {
    console.log('closeModal called');
    setIsOpen(false);
  }, []);
  
  return {
    isOpen,
    setIsOpen,
    openModal,
    closeModal,
    canShowContextModal
  };
}; 