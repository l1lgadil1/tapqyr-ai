"use client";

import { useState } from "react";
import { Brain } from "lucide-react";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { UserContextModal } from "./user-context-modal";
import { UserContext, UpdateUserContextRequest } from "../../../shared/api/types/user";

interface ContextButtonProps {
  userContext: UserContext | null;
  onUpdateContext: (data: UpdateUserContextRequest) => Promise<void>;
}

export function ContextButton({
  userContext,
  onUpdateContext,
}: ContextButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isContextEmpty = !userContext?.workDescription && 
    !userContext?.shortTermGoals && 
    !userContext?.longTermGoals && 
    !userContext?.otherContext;
    
  const isContextPartial = userContext && (
    (userContext.workDescription && !userContext.shortTermGoals) ||
    (userContext.workDescription && !userContext.longTermGoals) ||
    (userContext.shortTermGoals && !userContext.longTermGoals) ||
    (userContext.shortTermGoals && !userContext.workDescription) ||
    (userContext.longTermGoals && !userContext.workDescription) ||
    (userContext.longTermGoals && !userContext.shortTermGoals)
  );
  
  const showBadge = isContextEmpty || isContextPartial;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="relative flex items-center justify-center w-8 h-8 p-0"
        title="AI Context"
      >
        <Brain className="h-4 w-4" />
        
        {showBadge && (
          <Badge 
            variant="info"
            className="absolute -top-1 -right-1 h-2 w-2 p-0"
          />
        )}
      </Button>
      
      <UserContextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userContext={userContext}
        onUpdateContext={onUpdateContext}
      />
    </>
  );
} 