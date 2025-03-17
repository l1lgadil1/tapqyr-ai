import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/card';
import { useUserOnboardingStore } from '../model/store';
import { Briefcase, Target, Compass, Info } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { Button } from '../../../shared/ui/button';

interface UserContextDisplayProps {
  className?: string;
}

/**
 * Component to display user context information if it's already filled
 */
export const UserContextDisplay: FC<UserContextDisplayProps> = ({ className }) => {
  const {
    isOnboardingComplete,
    workDescription,
    shortTermGoals,
    longTermGoals,
    otherContext,
    setOnboardingModalOpen
  } = useUserOnboardingStore();

  // If onboarding is not complete, don't show anything
  if (!isOnboardingComplete) {
    return null;
  }

  // Check if any context is filled
  const hasContext = !!(workDescription || shortTermGoals || longTermGoals || otherContext);

  if (!hasContext) {
    return null;
  }

  const handleEditClick = () => {
    setOnboardingModalOpen(true);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Your Context</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEditClick}
            className="text-xs"
          >
            Edit
          </Button>
        </div>
        <CardDescription>Information you've shared to help AI understand your needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {workDescription && (
          <div className="flex gap-3">
            <Briefcase className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Work Context</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{workDescription}</p>
            </div>
          </div>
        )}
        
        {shortTermGoals && (
          <div className="flex gap-3">
            <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Short-term Goals</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{shortTermGoals}</p>
            </div>
          </div>
        )}
        
        {longTermGoals && (
          <div className="flex gap-3">
            <Compass className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Long-term Goals</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{longTermGoals}</p>
            </div>
          </div>
        )}
        
        {otherContext && (
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Additional Context</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{otherContext}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 