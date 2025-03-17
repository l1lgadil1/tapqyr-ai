import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Textarea } from '../../../shared/ui/textarea';
import { useUserOnboardingStore, OnboardingStep } from '../model/store';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../../shared/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { useTranslation } from 'react-i18next';

/**
 * Onboarding modal component that guides users through providing context information
 */
export const OnboardingModal = () => {
  const { t } = useTranslation('onboarding');
  const {
    isOnboardingModalOpen,
    currentStep,
    workDescription,
    shortTermGoals,
    longTermGoals,
    otherContext,
    isLoading,
    error,
    setWorkDescription,
    setShortTermGoals,
    setLongTermGoals,
    setOtherContext,
    nextStep,
    previousStep,
    setOnboardingModalOpen,
    isOnboardingComplete
  } = useUserOnboardingStore();

  const { toast } = useToast();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Local state for the current input value
  const [currentValue, setCurrentValue] = useState('');

  // Update the local state when the current step changes
  useEffect(() => {
    switch (currentStep) {
      case 'work':
        setCurrentValue(workDescription);
        break;
      case 'shortTerm':
        setCurrentValue(shortTermGoals);
        break;
      case 'longTerm':
        setCurrentValue(longTermGoals);
        break;
      case 'other':
        setCurrentValue(otherContext);
        break;
      default:
        setCurrentValue('');
    }
  }, [currentStep, workDescription, shortTermGoals, longTermGoals, otherContext]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentValue(e.target.value);
  };

  // Handle next button click
  const handleNext = () => {
    // Update the appropriate store value based on the current step
    switch (currentStep) {
      case 'work':
        setWorkDescription(currentValue);
        break;
      case 'shortTerm':
        setShortTermGoals(currentValue);
        break;
      case 'longTerm':
        setLongTermGoals(currentValue);
        break;
      case 'other':
        setOtherContext(currentValue);
        break;
      default:
        break;
    }

    // Move to the next step
    nextStep();

    // Show toast when completing the onboarding
    if (currentStep === 'other') {
      toast({
        title: t('modal.toasts.complete.title'),
        description: t('modal.toasts.complete.description'),
        duration: 5000,
      });
    }
  };

  // Handle back button click
  const handleBack = () => {
    // Update the appropriate store value based on the current step
    switch (currentStep) {
      case 'shortTerm':
        setShortTermGoals(currentValue);
        break;
      case 'longTerm':
        setLongTermGoals(currentValue);
        break;
      case 'other':
        setOtherContext(currentValue);
        break;
      default:
        break;
    }

    // Move to the previous step
    previousStep();
  };

  // Handle close attempt
  const handleCloseAttempt = (open: boolean) => {
    if (!open && !isOnboardingComplete) {
      setShowCloseConfirm(true);
    } else if (!open) {
      setOnboardingModalOpen(false);
    }
  };

  // Handle exit confirmation
  const handleExit = () => {
    setShowCloseConfirm(false);
    setOnboardingModalOpen(false);
    toast({
      title: t('modal.toasts.postponed.title'),
      description: t('modal.toasts.postponed.description'),
      duration: 5000,
    });
  };

  // Handle alert dialog close
  const handleAlertClose = (open: boolean) => {
    if (!open) {
      setShowCloseConfirm(false);
    }
  };

  // Get the title and description based on the current step
  const getStepContent = (step: OnboardingStep) => {
    return {
      title: t(`modal.steps.${step}.title`),
      description: t(`modal.steps.${step}.description`),
      placeholder: t(`modal.steps.${step}.placeholder`),
    };
  };

  const { title, description, placeholder } = getStepContent(currentStep);

  return (
    <>
      <Dialog open={isOnboardingModalOpen} onOpenChange={handleCloseAttempt}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            
            <Textarea
              value={currentValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="min-h-[150px] resize-none"
            />
            
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            {currentStep !== 'work' && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={isLoading}
              >
                {t('modal.buttons.back')}
              </Button>
            )}
            
            <div className="flex-1"></div>
            
            <Button 
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('modal.buttons.saving')}
                </>
              ) : (
                currentStep === 'other' ? t('modal.buttons.complete') : t('modal.buttons.next')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCloseConfirm} onOpenChange={handleAlertClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('modal.alerts.exitTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('modal.alerts.exitDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCloseConfirm(false)}>
              {t('modal.alerts.exitCancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>
              {t('modal.alerts.exitConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 