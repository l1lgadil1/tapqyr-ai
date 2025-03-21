"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Brain, Sparkles, X, Zap, Target, Lightbulb, ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
      description: "Help the AI understand what you do day-to-day",
      prompt: "Share details about your role, industry, main responsibilities, and typical tasks. The more specific you are, the better AI can tailor its responses to your specific work context.",
      examples: [
        "Senior software engineer at a fintech startup, building REST APIs with TypeScript and Next.js",
        "Project manager for construction projects, coordinating teams of 10-20 people",
        "Independent graphic designer specializing in brand identity and packaging"
      ],
      placeholder: "I work as a...",
      icon: <Brain className="h-5 w-5" />,
      benefitIcon: <Zap className="h-4 w-4" />,
      benefit: "100x more relevant suggestions based on your specific job context"
    },
    {
      title: "Short Term Focus",
      field: "shortTermGoals" as const,
      description: "What are you trying to accomplish right now?",
      prompt: "Describe your current projects, immediate goals, or problems you're trying to solve. This helps AI prioritize the most important aspects of your work.",
      examples: [
        "Optimizing our authentication flow to reduce login failures by 50%",
        "Preparing for a client presentation about the new marketing strategy",
        "Learning TypeScript to improve my frontend development skills"
      ],
      placeholder: "I'm currently focused on...",
      icon: <ChevronRight className="h-5 w-5" />,
      benefitIcon: <Target className="h-4 w-4" />,
      benefit: "Get responses focused on your immediate priorities"
    },
    {
      title: "Long Term Goals",
      field: "longTermGoals" as const,
      description: "What are you working towards in the bigger picture?",
      prompt: "Share your career aspirations, skills you want to develop, or major objectives. AI can help suggest steps toward these larger goals.",
      examples: [
        "Transitioning from developer to a technical leadership role in the next 2 years",
        "Building a SaaS product that generates $10k MRR by the end of the year",
        "Becoming proficient in AI/ML to create more intelligent applications"
      ],
      placeholder: "In the longer term, I want to...",
      icon: <Sparkles className="h-5 w-5" />,
      benefitIcon: <ArrowUpRight className="h-4 w-4" />,
      benefit: "Get strategic recommendations that align with your career path"
    },
    {
      title: "Other Context",
      field: "otherContext" as const,
      description: "Anything else that would help the AI understand you better",
      prompt: "Share your preferences, communication style, learning preferences, or other relevant information that would help AI tailor its responses to you.",
      examples: [
        "I prefer concise, direct communication with code examples",
        "I'm a visual learner and understand concepts better with diagrams",
        "I like to understand the 'why' behind recommendations"
      ],
      placeholder: "Other helpful information...",
      icon: <Lightbulb className="h-5 w-5" />,
      benefitIcon: <Brain className="h-4 w-4" />,
      benefit: "Get responses that match your personal preferences and style"
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

  const handleFieldUpdate = async (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // When in edit mode, automatically save changes to the backend
    if (mode === "edit") {
      setIsUpdating(true);
      try {
        await onUpdateContext({
          ...formData,
          [field]: value, // Use the latest value
          onboardingComplete: true,
        });
      } catch (error) {
        console.error("Failed to update context:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const renderStepMode = () => {
    const currentField = steps[currentStep].field;
    const currentStepData = steps[currentStep];

    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">{currentStep + 1} of {steps.length}</span>
            <span className="text-sm font-medium">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <Progress
            value={((currentStep + 1) / steps.length) * 100}
            className="h-2 bg-secondary/5 rounded-full overflow-hidden"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col flex-grow"
          >
            <div className="mb-5">
              <motion.h3 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
              >
                {currentStepData.title}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-base text-muted-foreground"
              >
                {currentStepData.description}
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5 mb-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 shadow-sm"
              >
                <div className="flex flex-col h-full">
                  <h4 className="text-base font-medium mb-2">Why it matters</h4>
                  <p className="text-sm text-muted-foreground">{currentStepData.benefit}</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 shadow-sm sm:col-span-2"
              >
                <div className="flex flex-col h-full">
                  <h4 className="text-base font-medium mb-2">How to answer</h4>
                  <p className="text-sm text-muted-foreground mb-3">{currentStepData.prompt}</p>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mb-5"
            >
              <h4 className="text-base font-medium mb-3">Examples</h4>
              <div className="grid gap-2">
                {currentStepData.examples.map((example, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    {example}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="flex-grow mb-4 min-h-[150px]"
            >
              <label className="block text-base font-medium mb-2">Your response</label>
              <Textarea
                value={formData[currentField]}
                onChange={(e) => handleFieldUpdate(currentField, e.target.value)}
                placeholder={currentStepData.placeholder}
                className="h-full min-h-[150px] resize-none bg-white/5 backdrop-blur-sm border-white/10 focus-visible:ring-primary/30 text-base w-full rounded-lg p-4 transition-all focus:border-primary/50"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="flex justify-between pt-4 border-t border-white/10 mt-auto"
        >
          <div>
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="gap-1.5 border-white/10 hover:bg-white/5 text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              Skip for now
            </Button>
            <Button 
              onClick={handleNext}
              disabled={isUpdating}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Complete</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderEditMode = () => {
    return (
      <div className="flex flex-col h-full">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-5 mb-6 border border-primary/20 backdrop-blur-sm"
        >
          <h4 className="text-lg font-semibold mb-2">
            Make AI understand your context
          </h4>
          <p className="text-sm text-muted-foreground mb-0">
            The AI adapts to your specific needs based on the information you provide below.
            All sections are automatically saved when edited.
          </p>
        </motion.div>
        <div className="relative flex-grow overflow-auto pr-1">
          <div className="grid gap-6 pb-2">
            {steps.map((step, index) => (
              <motion.div
                key={step.field}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden transition-all hover:border-primary/20 hover:shadow-md"
              >
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/90 text-primary-foreground text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h3 className="text-base font-semibold">{step.title}</h3>
                    </div>
                    <div className="text-xs font-medium text-primary/80 bg-primary/10 px-2 py-1 rounded-full">
                      {formData[step.field] ? "Saved" : "Not set"}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-8">
                    {step.description}
                  </p>
                </div>
                <div className="p-4">
                  <EditableField
                    label=""
                    value={formData[step.field]}
                    placeholder={step.placeholder}
                    onSave={(value) => handleFieldUpdate(step.field, value)}
                    multiline
                    className="mt-0"
                    hintText={step.prompt}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "sm:max-h-[90dvh] max-w-full sm:max-w-[800px] p-5 sm:p-6",
        "border-0 sm:border sm:border-white/20",
        "rounded-none sm:rounded-xl",
        "shadow-xl",
        "fixed inset-0 fixed inset-auto top-1/2 left-1/2 -translate-x-1/2:-translate-y-1/2",
        "flex flex-col h-auto w-full",
        "bg-gradient-to-b from-background to-background/95",
        "z-50",
      )}
      hideCloseButton
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-20" />
        </div>

        <DialogHeader className="pb-4 relative border-b border-white/10 mb-5">
          <DialogTitle className="flex items-center justify-between gap-2 text-2xl font-bold">
            <span>Your AI Context Profile</span>
            <DialogClose className="rounded-full w-8 h-8 flex items-center justify-center opacity-70 transition-opacity hover:opacity-100 focus:outline-none bg-white/10 hover:bg-white/20">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-auto">
          {mode === "step" ? renderStepMode() : renderEditMode()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 