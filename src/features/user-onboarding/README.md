# User Onboarding Feature

This feature provides components and state management for collecting and displaying user context information.

## Components

### UserContextDisplay

Displays the user's context information if they have completed the onboarding process. This component will:

- Only render if the user has completed onboarding
- Only show sections where the user has provided information
- Provide an edit button to reopen the onboarding modal

### UserContextButton

A button component that:
- Shows a notification dot if onboarding is not complete
- Changes appearance when onboarding is complete
- Opens the onboarding modal when clicked

### OnboardingModal

A multi-step modal that guides users through providing context information:
- Work description
- Short-term goals
- Long-term goals
- Additional context

### UserContextModal

A modal component that displays the user's existing context information:
- Only shows sections where the user has provided information
- Provides an edit button to open the onboarding modal for editing
- Can be controlled via the `useUserContextModal` hook

## Hooks

### useUserContextModal

A hook that provides state management for the UserContextModal:
- `isOpen`: Boolean state for modal visibility
- `setIsOpen`: Function to directly control modal state
- `openModal`: Function to open the modal (only if user has context)
- `closeModal`: Function to close the modal
- `canShowContextModal`: Boolean indicating if the modal can be shown (user has completed onboarding and has context)

## Usage

### Basic Implementation

```tsx
import { OnboardingModal, UserContextButton, UserContextDisplay, useUserOnboardingStore } from '@/features/user-onboarding';
import { useEffect } from 'react';

export const YourComponent = () => {
  const { loadUserContext, userId } = useUserOnboardingStore();
  
  // Load user context when component mounts
  useEffect(() => {
    if (userId) {
      loadUserContext();
    }
  }, [userId, loadUserContext]);
  
  return (
    <div>
      {/* Always include the modal component */}
      <OnboardingModal />
      
      {/* The button to open the modal */}
      <UserContextButton />
      
      {/* This will only render if the user has completed onboarding and has context */}
      <UserContextDisplay />
    </div>
  );
};
```

### Using the Context Modal

```tsx
import { OnboardingModal, UserContextModal, useUserContextModal, useUserOnboardingStore } from '@/features/user-onboarding';
import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';

export const YourComponent = () => {
  const { loadUserContext, userId } = useUserOnboardingStore();
  const { isOpen, setIsOpen, openModal, canShowContextModal } = useUserContextModal();
  
  // Load user context when component mounts
  useEffect(() => {
    if (userId) {
      loadUserContext();
    }
  }, [userId, loadUserContext]);
  
  return (
    <div>
      {/* Always include the onboarding modal */}
      <OnboardingModal />
      
      {/* Include the context modal */}
      <UserContextModal open={isOpen} onOpenChange={setIsOpen} />
      
      {/* Button to open the context modal */}
      {canShowContextModal && (
        <Button onClick={openModal}>
          View Your Context
        </Button>
      )}
    </div>
  );
};
```

### Checking Onboarding Status

You can use the store to check if the user has completed onboarding:

```tsx
import { useUserOnboardingStore } from '@/features/user-onboarding';

export const YourComponent = () => {
  const { isOnboardingComplete } = useUserOnboardingStore();
  
  return (
    <div>
      {isOnboardingComplete ? (
        <p>Thank you for completing onboarding!</p>
      ) : (
        <p>Please complete the onboarding process.</p>
      )}
    </div>
  );
};
```

### Accessing User Context Data

You can access the user's context data directly from the store:

```tsx
import { useUserOnboardingStore } from '@/features/user-onboarding';

export const YourComponent = () => {
  const { 
    workDescription, 
    shortTermGoals, 
    longTermGoals, 
    otherContext 
  } = useUserOnboardingStore();
  
  // Use the context data as needed
  return (
    <div>
      <h2>Your Work Context</h2>
      <p>{workDescription || 'Not provided'}</p>
      
      {/* ... other context data */}
    </div>
  );
};
```

## State Management

The feature uses Zustand for state management with persistence to localStorage. The store includes:

- User data (userId, email, onboarding status)
- Context information (work, goals, etc.)
- Modal state (open/closed, current step)
- API actions (load, save, complete onboarding)

## API Integration

The store integrates with the following API endpoints:
- `createUser`: Creates a new user
- `getUserContext`: Retrieves user context
- `updateUserContext`: Updates user context

These are imported from `@/shared/api/user-api`. 