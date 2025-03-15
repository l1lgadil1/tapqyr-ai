import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/lib/utils';
import { Message } from '../model/store';
import { AIActionButtons, ActionButton } from './ai-action-buttons';
import { BrainCircuit, User, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/ui/button';
import { generateSuggestedActions } from '../api';
import { useAIAssistantStore } from '../model';

interface AIMessageProps {
  message: Message;
  isLast: boolean;
  onActionClick: (action: ActionButton) => void;
  onSuggestedActionsGenerated?: (messageId: string, actions: ActionButton[]) => void;
  onSuggestedActionsDismissed?: (messageId: string) => void;
  className?: string;
}

export function AIMessage({
  message,
  isLast,
  onActionClick,
  onSuggestedActionsGenerated,
  onSuggestedActionsDismissed,
  className
}: AIMessageProps) {
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(!!message.suggestedActions);
  const getChatHistory = useAIAssistantStore(state => state.getChatHistory);
  
  // Get the chat history
  const chatHistory = getChatHistory(10); // Get the last 10 messages
  
  const handleGenerateActions = async () => {
    if (isGeneratingActions || message.isUser) return;
    
    setIsGeneratingActions(true);
    
    try {
      const result = await generateSuggestedActions(message.content, chatHistory);
      
      if (result.actions.length > 0) {
        setShowActionButtons(true);
        onSuggestedActionsGenerated?.(message.id, result.actions);
      }
    } catch (error) {
      console.error('Error generating suggested actions:', error);
    } finally {
      setIsGeneratingActions(false);
    }
  };
  
  const handleDismissActions = () => {
    setShowActionButtons(false);
    onSuggestedActionsDismissed?.(message.id);
  };
  
  return (
    <motion.div
      className={cn(
        "flex flex-col w-full",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "flex items-start gap-2",
        message.isUser ? "justify-end" : "justify-start"
      )}>
        {!message.isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="h-4 w-4 text-primary" />
          </div>
        )}
        
        <div className={cn(
          "max-w-[80%] rounded-lg p-3",
          message.isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {/* Action Result Display */}
          {!message.isUser && message.hasAction && message.actionResult && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-1 text-xs font-medium">
                {message.actionResult.success ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Action completed</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Action failed</span>
                  </>
                )}
              </div>
              {message.actionResult.data && Object.keys(message.actionResult.data).length > 0 && (
                <div className="mt-1 text-xs opacity-80">
                  <pre className="whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(message.actionResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {/* Loading indicator for action processing */}
          {!message.isUser && message.hasAction && !message.actionResult && (
            <div className="mt-2 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Processing action...</span>
            </div>
          )}
          
          {!message.isUser && isLast && !message.suggestedActions && !showActionButtons && !message.hasAction && (
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 opacity-70 hover:opacity-100"
                onClick={handleGenerateActions}
                disabled={isGeneratingActions}
              >
                {isGeneratingActions ? (
                  <>
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Suggest actions
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        {message.isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>
      
      {!message.isUser && message.suggestedActions && showActionButtons && (
        <div className="ml-10 mt-2">
          <AIActionButtons
            actions={message.suggestedActions}
            onActionClick={onActionClick}
            onDismiss={handleDismissActions}
            messageContext={message.content}
            chatHistory={chatHistory}
          />
        </div>
      )}
    </motion.div>
  );
} 