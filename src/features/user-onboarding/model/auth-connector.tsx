import { FC, useEffect } from 'react';
import { useAuthStore } from '../../auth/model';
import { useUserOnboardingStore } from './store';
import { userApiService } from '../../../shared/api/api-service';

/**
 * Component that syncs the authenticated user ID with the onboarding user ID
 * This should be mounted once at the app root level
 */
export const UserOnboardingAuthConnector: FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    setUserId, 
    setEmail, 
    userId, 
    loadUserContext,
    email,
    isOnboardingComplete
  } = useUserOnboardingStore();
  
  // Initialize user context fields in the backend
  const initializeUserContext = async (id: string) => {
    try {
      // Initialize with empty strings to avoid null values
      await userApiService.updateUserContext(id, {
        workDescription: '',
        shortTermGoals: '',
        longTermGoals: '',
        otherContext: '',
        onboardingComplete: false
      });
      console.log('UserOnboardingAuthConnector: Initialized user context fields');
    } catch (error) {
      console.error('Error initializing user context fields:', error);
    }
  };
  
  // Sync auth user with onboarding user
  useEffect(() => {
    const syncAuthUser = async () => {
      if (isAuthenticated && user) {
        console.log('UserOnboardingAuthConnector: Auth user detected', user);
        
        // Set the user ID and email from auth
        setUserId(user.id);
        if (user.email) {
          setEmail(user.email);
        }
        
        // Check if user exists in backend
        try {
          await userApiService.getUserById(user.id);
        } catch {
          // User doesn't exist in backend, create it
          console.log('UserOnboardingAuthConnector: Creating user in backend', user);
          await userApiService.createUser({ 
            email: user.email,
            name: user.name 
          });
          
          // Initialize context fields
          await initializeUserContext(user.id);
        }
        
        // Check if context fields are null and initialize them if needed
        try {
          const userContext = await userApiService.getUserContext(user.id);
          const hasNullFields = 
            userContext.workDescription === null || 
            userContext.shortTermGoals === null || 
            userContext.longTermGoals === null || 
            userContext.otherContext === null;
            
          if (hasNullFields) {
            console.log('UserOnboardingAuthConnector: Found null context fields, initializing');
            await initializeUserContext(user.id);
          }
        } catch (error) {
          console.error('Error checking context fields:', error);
        }
        
        // Load user context if we have a user ID
        if (user.id) {
          await loadUserContext();
        }
      }
    };
    
    syncAuthUser();
  }, [isAuthenticated, user, setUserId, setEmail, loadUserContext]);
  
  // Ensure user exists in backend when we have a userId but no auth user
  // This handles the case where the user ID is persisted in localStorage
  // but the user doesn't exist in the backend yet
  useEffect(() => {
    const ensureUserExists = async () => {
      if (userId && !isAuthenticated && email) {
        console.log('UserOnboardingAuthConnector: Ensuring user exists in backend', { userId, email });
        
        try {
          // Check if user exists
          try {
            await userApiService.getUserById(userId);
            console.log('UserOnboardingAuthConnector: User exists in backend');
            
            // Check if context fields are null and initialize them if needed
            try {
              const userContext = await userApiService.getUserContext(userId);
              const hasNullFields = 
                userContext.workDescription === null || 
                userContext.shortTermGoals === null || 
                userContext.longTermGoals === null || 
                userContext.otherContext === null;
                
              if (hasNullFields) {
                console.log('UserOnboardingAuthConnector: Found null context fields, initializing');
                await initializeUserContext(userId);
              }
            } catch (error) {
              console.error('Error checking context fields:', error);
            }
          } catch {
            // User doesn't exist, create it
            console.log('UserOnboardingAuthConnector: User does not exist in backend, creating');
            await userApiService.createUser({ email });
            
            // Initialize context fields
            await initializeUserContext(userId);
          }
          
          // Load user context
          await loadUserContext();
        } catch (error) {
          console.error('Error ensuring user exists:', error);
        }
      }
    };
    
    ensureUserExists();
  }, [userId, isAuthenticated, email, loadUserContext]);
  
  // Periodically sync context data with backend
  useEffect(() => {
    // Only sync if we have a user ID
    if (!userId) return;
    
    // Function to sync context data
    const syncContextData = async () => {
      try {
        await loadUserContext();
        console.log('UserOnboardingAuthConnector: Synced context data with backend');
      } catch (error) {
        console.error('Error syncing context data:', error);
      }
    };
    
    // Initial sync
    syncContextData();
    
    // Set up interval for periodic sync (every 30 seconds)
    const intervalId = setInterval(syncContextData, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [userId, loadUserContext]);
  
  // For debugging
  useEffect(() => {
    console.log('UserOnboardingAuthConnector: userId =', userId);
    console.log('UserOnboardingAuthConnector: isAuthenticated =', isAuthenticated);
    console.log('UserOnboardingAuthConnector: isOnboardingComplete =', isOnboardingComplete);
  }, [userId, isAuthenticated, isOnboardingComplete]);
  
  // This is a headless component, it doesn't render anything
  return null;
}; 