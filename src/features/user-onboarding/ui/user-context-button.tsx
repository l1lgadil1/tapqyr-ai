import { FC, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { useUserOnboardingStore } from '../model/store';
import { useUserContextModal } from '../model/use-user-context-modal';
import { UserCircle, Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../shared/ui/tooltip';
import { cn } from '../../../shared/lib/utils';

interface UserContextButtonProps {
  className?: string;
}

export const UserContextButton: FC<UserContextButtonProps> = ({ className }) => {
  const { 
    setOnboardingModalOpen, 
    isOnboardingComplete, 
    userId, 
    initializeUser,
    workDescription,
    shortTermGoals,
    longTermGoals,
    otherContext
  } = useUserOnboardingStore();
  
  const { openModal, canShowContextModal } = useUserContextModal();
  
  // Debug logging
  useEffect(() => {
    console.log('UserContextButton: userId =', userId);
    console.log('UserContextButton: isOnboardingComplete =', isOnboardingComplete);
    console.log('UserContextButton: canShowContextModal =', canShowContextModal);
    console.log('UserContextButton: context data =', {
      workDescription,
      shortTermGoals,
      longTermGoals,
      otherContext
    });
  }, [userId, isOnboardingComplete, canShowContextModal, workDescription, shortTermGoals, longTermGoals, otherContext]);
  
  const handleClick = () => {
    console.log('UserContextButton clicked');
    console.log('Current state:', {
      userId,
      isOnboardingComplete,
      canShowContextModal
    });
    
    if (!userId) {
      // If no user exists, create one with a temporary email
      // In a real app, you would get this from authentication
      const tempEmail = `user_${Date.now()}@example.com`;
      console.log('Initializing user with email:', tempEmail);
      initializeUser(tempEmail);
      return;
    }
    
    if (canShowContextModal) {
      // If user has completed onboarding and has context, show the context modal
      console.log('Opening context modal');
      openModal();
    } else {
      // Otherwise, open the onboarding modal
      console.log('Opening onboarding modal');
      setOnboardingModalOpen(true);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className={cn(
              className,
              "relative group transition-all duration-300",
              !isOnboardingComplete && "animate-pulse",
              isOnboardingComplete && "hover:bg-primary/10"
            )}
            aria-label={isOnboardingComplete ? "View your context" : "Set up your context"}
          >
            {isOnboardingComplete ? (
              <>
                <UserCircle className={cn(
                  "h-5 w-5 transition-all duration-300",
                  "text-primary group-hover:scale-110"
                )} />
                <Settings className={cn(
                  "absolute h-3 w-3 -top-0.5 -right-0.5",
                  "text-primary opacity-0 group-hover:opacity-100",
                  "transition-all duration-300 group-hover:rotate-90"
                )} />
              </>
            ) : (
              <UserCircle className={cn(
                "h-5 w-5 transition-all duration-300",
                "text-muted-foreground group-hover:text-primary",
                "group-hover:scale-110"
              )} />
            )}
            {!isOnboardingComplete && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[250px]">
          {isOnboardingComplete ? (
            <>
              <p className="font-medium">AI Context Settings</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to view or update your work context, goals, and AI preferences
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-destructive">Setup Needed</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete your profile setup to help our AI understand your context better
              </p>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 