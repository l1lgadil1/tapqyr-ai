"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Brain, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Textarea } from "../../../shared/ui/textarea";
import { Progress } from "../../../shared/ui/progress";
import { EditableField } from "../../../shared/ui/editable-field";
import { cn } from "../../../shared/lib/utils";
import { UserContext, UpdateUserContextRequest } from "../../../shared/api/types/user";

interface UserContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  userContext: UserContext | null;
  onUpdateContext: (data: UpdateUserContextRequest) => Promise<void>;
}

export function UserContextModal({
  isOpen,
  onClose,
  userContext,
  onUpdateContext,
}: UserContextModalProps) {
  const [mode, setMode] = useState<"step" | "edit">("step");
  const [currentStep, setCurrentStep] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<{
    workDescription: string;
    shortTermGoals: string;
    longTermGoals: string;
    otherContext: string;
  }>({
    workDescription: userContext?.workDescription || "",
    shortTermGoals: userContext?.shortTermGoals || "",
    longTermGoals: userContext?.longTermGoals || "",
    otherContext: userContext?.otherContext || "",
  });

  const isContextEmpty = !userContext?.workDescription && 
    !userContext?.shortTermGoals && 
    !userContext?.longTermGoals && 
    !userContext?.otherContext;

  useEffect(() => {
    // Determine the initial mode based on the context data
    if (isOpen) {
      setMode(isContextEmpty ? "step" : "edit");
      setCurrentStep(0);
    }
  }, [isOpen, isContextEmpty]);

  useEffect(() => {
    // Update form data when userContext changes
    if (userContext) {
      setFormData({
        workDescription: userContext.workDescription || "",
        shortTermGoals: userContext.shortTermGoals || "",
        longTermGoals: userContext.longTermGoals || "",
        otherContext: userContext.otherContext || "",
      });
    }
  }, [userContext]);

  const steps = [
    {
      title: "Work Description",
      field: "workDescription" as const,
      description: "Describe your current work, role, or main activities.",
      placeholder: "I am a software developer working on...",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      title: "Short Term Focus",
      field: "shortTermGoals" as const,
      description: "What are your immediate priorities or goals?",
      placeholder: "Complete the current project, learn a new skill...",
      icon: <ChevronRight className="h-5 w-5" />,
    },
    {
      title: "Long Term Goals",
      field: "longTermGoals" as const,
      description: "What are your long-term career or personal development goals?",
      placeholder: "Become a team lead, master new technologies...",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: "Other Context",
      field: "otherContext" as const,
      description: "Any other information that might be helpful.",
      placeholder: "Preferences, working style, interests...",
      icon: <Brain className="h-5 w-5" />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleCompleteSteps();
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleCompleteSteps();
    }
  };

  const handleCompleteSteps = async () => {
    setIsUpdating(true);
    try {
      await onUpdateContext({
        ...formData,
        onboardingComplete: true,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update context:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEditMode = async () => {
    setIsUpdating(true);
    try {
      await onUpdateContext({
        ...formData,
        onboardingComplete: true,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update context:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFieldUpdate = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStepMode = () => {
    const currentField = steps[currentStep].field;

    return (
      <div className="flex flex-col h-full">
        <div className="space-y-2 mb-4">
          <Progress
            value={((currentStep + 1) / steps.length) * 100}
            className="h-1.5 bg-secondary/10"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-grow"
          >
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {steps[currentStep].icon}
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>

            <div className="flex-grow mb-4 min-h-[200px]">
              <Textarea
                value={formData[currentField]}
                onChange={(e) => handleFieldUpdate(currentField, e.target.value)}
                placeholder={steps[currentStep].placeholder}
                className="h-full min-h-[200px] resize-none bg-background/50 border-primary/20 focus-visible:ring-primary/30 text-sm sm:text-base w-full"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between pt-2 border-t border-white/10 mt-auto">
          <div>
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="gap-1 border-primary/20 hover:bg-primary/5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
            <Button 
              onClick={handleNext}
              disabled={isUpdating}
              className="gap-1 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Complete
                  <Sparkles className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditMode = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="relative flex-grow overflow-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg opacity-50" />
          <div className="relative h-full">
            <div className="space-y-4 sm:space-y-6 pb-2">
              {steps.map((step) => (
                <div 
                  key={step.field}
                  className="p-4 bg-background/50 border border-white/10 rounded-lg hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {step.icon}
                    </div>
                    <h3 className="text-base font-medium">{step.title}</h3>
                  </div>
                  <EditableField
                    label=""
                    value={formData[step.field]}
                    placeholder={step.placeholder}
                    onSave={(value) => handleFieldUpdate(step.field, value)}
                    multiline
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-white/10 mt-4">
          <Button 
            variant="default" 
            onClick={handleSaveEditMode}
            disabled={isUpdating}
            className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
          >
            Save Changes
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "sm:max-h-[80dvh] max-w-full sm:max-w-[50svw] p-5 sm:p-6",
        "border-0 sm:border sm:border-white/10",
        "rounded-none sm:rounded-lg",
        "fixed inset-0 fixed inset-auto top-1/2 left-1/2 -translate-x-1/2:-translate-y-1/2",
        "flex flex-col h-screen h-auto w-full",
        "bg-background",
        "z-50"
      )}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/20 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-primary/20 rounded-full blur-3xl opacity-20" />
        </div>

        <DialogHeader className="pb-2 sm:pb-4 relative">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Your AI Context
            </span>
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-auto">
          {mode === "step" ? renderStepMode() : renderEditMode()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 