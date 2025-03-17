import { FC, useEffect } from 'react';
import { UserContextDisplay } from './user-context-display';
import { UserContextButton } from './user-context-button';
import { OnboardingModal } from './onboarding-modal';
import { UserContextModal } from './user-context-modal';
import { useUserOnboardingStore } from '../model/store';
import { useUserContextModal } from '../model/use-user-context-modal';

/**
 * Example component showing how to use the user onboarding components
 */
export const UserOnboardingExample: FC = () => {
  const { loadUserContext, userId } = useUserOnboardingStore();
  const { isOpen, setIsOpen } = useUserContextModal();
  
  // Load user context when component mounts
  useEffect(() => {
    if (userId) {
      loadUserContext();
    }
  }, [userId, loadUserContext]);
  
  return (
    <div className="space-y-6">
      {/* Always include the modal components */}
      <OnboardingModal />
      <UserContextModal open={isOpen} onOpenChange={setIsOpen} />
      
      {/* The button to open the appropriate modal */}
      <div className="flex justify-end">
        <UserContextButton />
      </div>
      
      {/* This will only render if the user has completed onboarding and has context */}
      <UserContextDisplay />
    </div>
  );
}; 