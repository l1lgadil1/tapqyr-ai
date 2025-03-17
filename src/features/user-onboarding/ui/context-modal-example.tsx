import { FC, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { useUserOnboardingStore } from '../model/store';
import { useUserContextModal } from '../model/use-user-context-modal';
import { UserContextModal } from './user-context-modal';
import { OnboardingModal } from './onboarding-modal';

/**
 * Example component showing how to use the user context modal
 */
export const UserContextModalExample: FC = () => {
  const { loadUserContext, userId } = useUserOnboardingStore();
  const { isOpen, setIsOpen, openModal, canShowContextModal } = useUserContextModal();
  
  // Load user context when component mounts
  useEffect(() => {
    if (userId) {
      loadUserContext();
    }
  }, [userId, loadUserContext]);
  
  return (
    <div className="space-y-6">
      {/* Always include the onboarding modal */}
      <OnboardingModal />
      
      {/* Include the context modal */}
      <UserContextModal open={isOpen} onOpenChange={setIsOpen} />
      
      {/* Button to open the context modal */}
      {canShowContextModal && (
        <Button onClick={openModal} variant="outline">
          View Your Context
        </Button>
      )}
    </div>
  );
}; 