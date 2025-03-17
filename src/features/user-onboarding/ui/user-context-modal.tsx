import { FC, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { useUserOnboardingStore } from '../model/store';
import { Briefcase, Target, Compass, Info, Loader2, RefreshCw } from 'lucide-react';
import { userApiService } from '../../../shared/api/api-service';
import { UserContext } from '../../../shared/api/user-api';
import './user-context-modal.css';

interface UserContextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal component to display existing user context information
 */
export const UserContextModal: FC<UserContextModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const {
    userId,
    workDescription: localWorkDescription,
    shortTermGoals: localShortTermGoals,
    longTermGoals: localLongTermGoals,
    otherContext: localOtherContext,
    setOnboardingModalOpen,
    isOnboardingComplete,
    loadUserContext
  } = useUserOnboardingStore();

  const [backendData, setBackendData] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Helper function to safely get context value (handle null values)
  const safeGetContextValue = (value: string | null | undefined): string => {
    return value === null || value === undefined ? '' : value;
  };

  // Use backend data if available, otherwise fall back to local data
  const workDescription = safeGetContextValue(backendData?.workDescription || localWorkDescription);
  const shortTermGoals = safeGetContextValue(backendData?.shortTermGoals || localShortTermGoals);
  const longTermGoals = safeGetContextValue(backendData?.longTermGoals || localLongTermGoals);
  const otherContext = safeGetContextValue(backendData?.otherContext || localOtherContext);

  // Initialize context fields in the backend if they are null
  const initializeContextFields = async (id: string) => {
    try {
      await userApiService.updateUserContext(id, {
        workDescription: workDescription || '',
        shortTermGoals: shortTermGoals || '',
        longTermGoals: longTermGoals || '',
        otherContext: otherContext || '',
      });
      console.log('UserContextModal: Initialized context fields in backend');
    } catch (error) {
      console.error('Error initializing context fields:', error);
    }
  };

  // Load backend data when modal opens
  useEffect(() => {
    const fetchBackendData = async () => {
      if (!open || !userId) return;

      setIsLoading(true);
      setError(null);

      try {
        // First try to get user context
        try {
          const data = await userApiService.getUserContext(userId);
          
          // Check if any fields are null
          const hasNullFields = 
            data.workDescription === null || 
            data.shortTermGoals === null || 
            data.longTermGoals === null || 
            data.otherContext === null;
            
          if (hasNullFields) {
            console.log('UserContextModal: Found null context fields, initializing');
            await initializeContextFields(userId);
            
            // Fetch updated data
            const updatedData = await userApiService.getUserContext(userId);
            setBackendData(updatedData);
            console.log('UserContextModal: Successfully fetched updated user context', updatedData);
          } else {
            setBackendData(data);
            console.log('UserContextModal: Successfully fetched user context', data);
          }
        } catch (contextError) {
          console.error('Error fetching user context, trying to get user by ID', contextError);
          
          // If that fails, try to get user by ID
          const userData = await userApiService.getUserById(userId);
          
          // Check if any fields are null
          const hasNullFields = 
            userData.workDescription === null || 
            userData.shortTermGoals === null || 
            userData.longTermGoals === null || 
            userData.otherContext === null;
            
          if (hasNullFields) {
            console.log('UserContextModal: Found null context fields, initializing');
            await initializeContextFields(userId);
            
            // Fetch updated data
            const updatedData = await userApiService.getUserById(userId);
            setBackendData(updatedData);
            console.log('UserContextModal: Successfully fetched updated user by ID', updatedData);
          } else {
            setBackendData(userData);
            console.log('UserContextModal: Successfully fetched user by ID', userData);
          }
        }
        
        // Also update local state to keep it in sync
        await loadUserContext();
      } catch (error) {
        console.error('Error fetching user data from backend:', error);
        setError('Failed to load context data from server');
        
        // If we have local data, use that
        if (localWorkDescription || localShortTermGoals || localLongTermGoals || localOtherContext) {
          console.log('UserContextModal: Using local data as fallback');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendData();
  }, [open, userId, loadUserContext, retryCount, localWorkDescription, localShortTermGoals, localLongTermGoals, localOtherContext]);

  // Debug logging
  useEffect(() => {
    console.log('UserContextModal: open =', open);
    console.log('UserContextModal: isOnboardingComplete =', isOnboardingComplete);
    console.log('UserContextModal: local context data =', {
      localWorkDescription,
      localShortTermGoals,
      localLongTermGoals,
      localOtherContext
    });
    console.log('UserContextModal: backend data =', backendData);
  }, [open, isOnboardingComplete, localWorkDescription, localShortTermGoals, localLongTermGoals, localOtherContext, backendData]);

  // Check if any context is filled
  const hasContext = !!(workDescription || shortTermGoals || longTermGoals || otherContext);

  useEffect(() => {
    console.log('UserContextModal: hasContext =', hasContext);
  }, [hasContext]);

  // If modal is open but we have no context and are not loading, close the modal
  useEffect(() => {
    if (open && !hasContext && !isLoading) {
      console.log('UserContextModal: No context available, closing modal');
      onOpenChange(false);
      
      // If user is logged in but has no context, open the onboarding modal
      if (userId) {
        console.log('UserContextModal: Opening onboarding modal instead');
        setOnboardingModalOpen(true);
      }
    }
  }, [open, hasContext, isLoading, userId, onOpenChange, setOnboardingModalOpen]);

  const handleEditClick = () => {
    console.log('UserContextModal: Edit button clicked');
    onOpenChange(false);
    setOnboardingModalOpen(true);
  };

  const handleRetryClick = () => {
    console.log('UserContextModal: Retry button clicked');
    setRetryCount(prev => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-background/80 backdrop-blur-md border border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Your Context</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading your context...</p>
          </div>
        ) : error ? (
          <div className="py-6">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
              {error}
            </div>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                We're having trouble loading your context from the server. 
                {(localWorkDescription || localShortTermGoals || localLongTermGoals || localOtherContext) ? 
                  ' Showing locally stored data instead.' : 
                  ' No local data available.'}
              </p>
              <Button variant="outline" size="sm" onClick={handleRetryClick}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : !hasContext ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">No context information available.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEditClick} 
              className="mt-4"
            >
              Set Up Context
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {workDescription && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">Work Context</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line pl-7">{workDescription}</p>
              </div>
            )}
            
            {shortTermGoals && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">Short-term Goals</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line pl-7">{shortTermGoals}</p>
              </div>
            )}
            
            {longTermGoals && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">Long-term Goals</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line pl-7">{longTermGoals}</p>
              </div>
            )}
            
            {otherContext && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">Additional Context</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line pl-7">{otherContext}</p>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          {hasContext && (
            <Button onClick={handleEditClick} className="w-full sm:w-auto">
              Edit Context
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 