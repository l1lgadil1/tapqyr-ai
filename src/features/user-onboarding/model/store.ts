import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userApiService } from '../../../shared/api/api-service';
import { UpdateUserContextRequest } from '../../../shared/api/user-api';

export type OnboardingStep = 'work' | 'shortTerm' | 'longTerm' | 'other' | 'complete';

interface UserOnboardingState {
  // User data
  userId: string | null;
  email: string | null;
  isOnboardingComplete: boolean;
  hasSeenOnboarding: boolean;  // Track if user has seen onboarding
  
  // Onboarding state
  isOnboardingModalOpen: boolean;
  currentStep: OnboardingStep;
  workDescription: string;
  shortTermGoals: string;
  longTermGoals: string;
  otherContext: string;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserId: (userId: string) => void;
  setEmail: (email: string) => void;
  setOnboardingComplete: (isComplete: boolean) => void;
  setOnboardingModalOpen: (isOpen: boolean) => void;
  setHasSeenOnboarding: (hasSeen: boolean) => void;
  setCurrentStep: (step: OnboardingStep) => void;
  setWorkDescription: (description: string) => void;
  setShortTermGoals: (goals: string) => void;
  setLongTermGoals: (goals: string) => void;
  setOtherContext: (context: string) => void;
  
  // API actions
  initializeUser: (email: string) => Promise<void>;
  loadUserContext: () => Promise<void>;
  saveCurrentStep: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
}

export const useUserOnboardingStore = create<UserOnboardingState>()(
  persist(
    (set, get) => ({
      // User data
      userId: null,
      email: null,
      isOnboardingComplete: false,
      hasSeenOnboarding: false,
      
      // Onboarding state
      isOnboardingModalOpen: false,
      currentStep: 'work',
      workDescription: '',
      shortTermGoals: '',
      longTermGoals: '',
      otherContext: '',
      
      // Loading states
      isLoading: false,
      error: null,
      
      // Actions
      setUserId: (userId) => set({ userId }),
      setEmail: (email) => set({ email }),
      setOnboardingComplete: (isComplete) => set({ isOnboardingComplete: isComplete }),
      setOnboardingModalOpen: (isOpen) => set({ isOnboardingModalOpen: isOpen }),
      setHasSeenOnboarding: (hasSeen) => set({ hasSeenOnboarding: hasSeen }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setWorkDescription: (description) => set({ workDescription: description }),
      setShortTermGoals: (goals) => set({ shortTermGoals: goals }),
      setLongTermGoals: (goals) => set({ longTermGoals: goals }),
      setOtherContext: (context) => set({ otherContext: context }),
      
      // API actions
      initializeUser: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          // Create a new user
          const user = await userApiService.createUser({ email });
          
          set({ 
            userId: user.id,
            email,
            isOnboardingModalOpen: true,
            isLoading: false
          });

          console.log('Store: User initialized', user);
        } catch (error) {
          console.error('Error initializing user:', error);
          set({ 
            error: 'Failed to initialize user', 
            isLoading: false 
          });
        }
      },
      
      loadUserContext: async () => {
        const { userId, hasSeenOnboarding } = get();
        
        if (!userId) {
          set({ error: 'No user ID available' });
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          let userContext;
          
          try {
            // First try to get user context
            userContext = await userApiService.getUserContext(userId);
            console.log('Store: Loaded user context', userContext);
          } catch (contextError) {
            console.error('Error loading user context, trying to get user by ID', contextError);
            
            // If that fails, try to get user by ID
            userContext = await userApiService.getUserById(userId);
            console.log('Store: Loaded user by ID', userContext);
          }
          
          // Ensure we have valid data
          if (!userContext) {
            throw new Error('Failed to load user context data');
          }
          
          // Helper function to safely get context value (handle null values)
          const safeGetContextValue = (value: string | null | undefined): string => {
            return value === null || value === undefined ? '' : value;
          };
          
          set({ 
            workDescription: safeGetContextValue(userContext.workDescription),
            shortTermGoals: safeGetContextValue(userContext.shortTermGoals),
            longTermGoals: safeGetContextValue(userContext.longTermGoals),
            otherContext: safeGetContextValue(userContext.otherContext),
            isOnboardingComplete: userContext.onboardingComplete,
            isLoading: false
          });
          
          // If any fields are null, try to fix them in the backend
          if (
            userContext.workDescription === null ||
            userContext.shortTermGoals === null ||
            userContext.longTermGoals === null ||
            userContext.otherContext === null
          ) {
            console.log('Store: Found null context fields, attempting to fix in backend');
            try {
              await userApiService.updateUserContext(userId, {
                workDescription: userContext.workDescription === null ? '' : userContext.workDescription,
                shortTermGoals: userContext.shortTermGoals === null ? '' : userContext.shortTermGoals,
                longTermGoals: userContext.longTermGoals === null ? '' : userContext.longTermGoals,
                otherContext: userContext.otherContext === null ? '' : userContext.otherContext,
              });
              console.log('Store: Fixed null context fields in backend');
            } catch (fixError) {
              console.error('Error fixing null context fields:', fixError);
            }
          }
          
          // Only show modal on first visit if onboarding is not complete
          if (!userContext.onboardingComplete && !hasSeenOnboarding) {
            set({ 
              isOnboardingModalOpen: true,
              hasSeenOnboarding: true
            });
          }
        } catch (error) {
          console.error('Error loading user context:', error);
          set({ 
            error: 'Failed to load user context', 
            isLoading: false 
          });
        }
      },
      
      saveCurrentStep: async () => {
        const { userId, currentStep, workDescription, shortTermGoals, longTermGoals, otherContext } = get();
        
        if (!userId) {
          set({ error: 'No user ID available' });
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const updateData: UpdateUserContextRequest = {};
          
          // Only update the field for the current step
          switch (currentStep) {
            case 'work':
              updateData.workDescription = workDescription;
              break;
            case 'shortTerm':
              updateData.shortTermGoals = shortTermGoals;
              break;
            case 'longTerm':
              updateData.longTermGoals = longTermGoals;
              break;
            case 'other':
              updateData.otherContext = otherContext;
              break;
            default:
              break;
          }
          
          const updatedContext = await userApiService.updateUserContext(userId, updateData);
          console.log('Store: Saved current step', { currentStep, updatedContext });
          
          set({ isLoading: false });
        } catch (error) {
          console.error('Error saving user context:', error);
          set({ 
            error: 'Failed to save user context', 
            isLoading: false 
          });
        }
      },
      
      completeOnboarding: async () => {
        const { userId } = get();
        
        if (!userId) {
          set({ error: 'No user ID available' });
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const updatedContext = await userApiService.updateUserContext(userId, { onboardingComplete: true });
          console.log('Store: Completed onboarding', updatedContext);
          
          set({ 
            isOnboardingComplete: true,
            isOnboardingModalOpen: false,
            currentStep: 'complete',
            isLoading: false
          });
        } catch (error) {
          console.error('Error completing onboarding:', error);
          set({ 
            error: 'Failed to complete onboarding', 
            isLoading: false 
          });
        }
      },
      
      nextStep: () => {
        const { currentStep, saveCurrentStep } = get();
        
        // Save the current step data
        saveCurrentStep();
        
        // Move to the next step
        switch (currentStep) {
          case 'work':
            set({ currentStep: 'shortTerm' });
            break;
          case 'shortTerm':
            set({ currentStep: 'longTerm' });
            break;
          case 'longTerm':
            set({ currentStep: 'other' });
            break;
          case 'other':
            set({ currentStep: 'complete' });
            // Complete the onboarding process
            get().completeOnboarding();
            break;
          default:
            break;
        }
      },
      
      previousStep: () => {
        const { currentStep } = get();
        
        // Move to the previous step
        switch (currentStep) {
          case 'shortTerm':
            set({ currentStep: 'work' });
            break;
          case 'longTerm':
            set({ currentStep: 'shortTerm' });
            break;
          case 'other':
            set({ currentStep: 'longTerm' });
            break;
          default:
            break;
        }
      }
    }),
    {
      name: 'user-onboarding-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
        email: state.email,
        isOnboardingComplete: state.isOnboardingComplete,
        isOnboardingModalOpen: state.isOnboardingModalOpen,
        hasSeenOnboarding: state.hasSeenOnboarding,
        workDescription: state.workDescription || '',
        shortTermGoals: state.shortTermGoals || '',
        longTermGoals: state.longTermGoals || '',
        otherContext: state.otherContext || '',
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.workDescription = state.workDescription || '';
          state.shortTermGoals = state.shortTermGoals || '';
          state.longTermGoals = state.longTermGoals || '';
          state.otherContext = state.otherContext || '';
          
          console.log('Store: Rehydrated state with sanitized context fields', state);
        }
      }
    }
  )
); 