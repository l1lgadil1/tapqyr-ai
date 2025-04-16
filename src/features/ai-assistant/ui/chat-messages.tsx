'use client';

import { forwardRef, useRef, useEffect } from 'react';
import { useAssistantStore, AssistantMessage } from '../model/assistant-store';
import { cn } from '../../../shared/lib/utils';
import { CircleAlert, Bot, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExecutedFunction {
  function: string;
  args: Record<string, unknown>;
  result: {
    id?: string;
    title?: string;
    count?: number;
    analysisGenerated?: boolean;
    success?: boolean;
    [key: string]: unknown;
  };
}

interface MessageProps {
  message: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    executedFunctions?: ExecutedFunction[];
    hasPendingCalls?: boolean;
    pendingCallsCount?: number;
  };
}

// Component to display executed functions
const ExecutedFunctions = ({ functions }: { functions: ExecutedFunction[] | undefined }) => {
  if (!functions || functions.length === 0) return null;
  
  // Check if there's a task creation or update function
  const hasTaskCreation = functions.some(fn => fn.function === 'create_task');
  const hasTaskUpdate = functions.some(fn => fn.function === 'update_task');
  const hasTaskDelete = functions.some(fn => fn.function === 'delete_task');
  const hasAnalysis = functions.some(fn => fn.function === 'analyze_productivity');
  
  return (
    <div className="mt-4 space-y-3 pt-3 border-t border-emerald-500/20">
      {/* Actions summary section */}
      <div className="flex flex-wrap gap-2">
        {hasTaskCreation && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-1 text-xs inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Task Created</span>
          </div>
        )}
        
        {hasTaskUpdate && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-full px-2 py-1 text-xs inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-blue-500" />
            <span className="text-blue-700 dark:text-blue-400 font-medium">Task Updated</span>
          </div>
        )}
        
        {hasTaskDelete && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-full px-2 py-1 text-xs inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-red-500" />
            <span className="text-red-700 dark:text-red-400 font-medium">Task Deleted</span>
          </div>
        )}
        
        {hasAnalysis && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-full px-2 py-1 text-xs inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-purple-500" />
            <span className="text-purple-700 dark:text-purple-400 font-medium">Analysis Performed</span>
          </div>
        )}
      </div>
      
      {/* Details of executed functions */}
      <div className="space-y-2">
        {functions.map((fn, index) => {
          // Определим цвет в зависимости от типа функции
          let borderColor = 'border-emerald-500/20';
          let bgColor = 'bg-emerald-500/5';
          let textColor = 'text-emerald-700 dark:text-emerald-400';
          
          if (fn.function === 'delete_task') {
            borderColor = 'border-red-500/20';
            bgColor = 'bg-red-500/5';
            textColor = 'text-red-700 dark:text-red-400';
          } else if (fn.function === 'update_task') {
            borderColor = 'border-blue-500/20';
            bgColor = 'bg-blue-500/5';
            textColor = 'text-blue-700 dark:text-blue-400';
          }
          
          return (
            <div key={index} className={`rounded-md bg-background/50 border ${borderColor} overflow-hidden`}>
              <div className={`${bgColor} px-3 py-1.5 flex items-center justify-between border-b ${borderColor}`}>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3.5 w-3.5 ${textColor}`} />
                  <span className={`font-medium text-xs ${textColor}`}>{fn.function}</span>
                </div>
                <span className="text-[10px] text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">executed</span>
              </div>
              
              <div className="p-2 text-xs">
                {fn.function === 'create_task' && fn.result.id && (
                  <div className="flex flex-col">
                    <span className="font-medium">Created task:</span>
                    <span className="mt-1 bg-background p-1.5 rounded border border-border">
                      <strong>{fn.result.title || 'Untitled'}</strong>
                    </span>
                    <span className="mt-1 text-muted-foreground text-[10px]">The task has been added to your task list</span>
                  </div>
                )}
                
                {fn.function === 'update_task' && fn.result.id && (
                  <div className="flex flex-col">
                    <span className="font-medium">Updated task:</span>
                    <span className="mt-1 bg-background p-1.5 rounded border border-border">
                      <strong>{fn.result.title || 'Untitled'}</strong>
                    </span>
                  </div>
                )}
                
                {fn.function === 'delete_task' && fn.result.success && (
                  <div className="flex flex-col">
                    <span className="font-medium">Deleted task:</span>
                    <span className="mt-1 bg-background p-1.5 rounded border border-border text-red-600">
                      Task was successfully deleted
                    </span>
                  </div>
                )}
                
                {fn.function === 'get_tasks' && typeof fn.result.count === 'number' && (
                  <div className="flex flex-col">
                    <span className="font-medium">Retrieved {fn.result.count} tasks</span>
                  </div>
                )}
                
                {fn.function === 'analyze_productivity' && fn.result.analysisGenerated && (
                  <div className="flex flex-col">
                    <span className="font-medium">Generated productivity analysis</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Component to display pending calls notification
const PendingCallsNotification = ({ count }: { count: number }) => {
  if (!count) return null;
  
  // Функция для открытия панели ожидающих подтверждения действий
  const openPendingCallsPanel = () => {
    // Найдем элемент с pending calls и прокрутим к нему
    const pendingCallsElement = document.querySelector('.pending-calls-container');
    if (pendingCallsElement) {
      pendingCallsElement.scrollIntoView({ behavior: 'smooth' });
      // Добавим временное выделение для привлечения внимания
      pendingCallsElement.classList.add('highlight-panel');
      setTimeout(() => {
        pendingCallsElement.classList.remove('highlight-panel');
      }, 1500);
    }
  };
  
  return (
    <div className="mt-4 space-y-3 pt-3 border-t border-amber-500/20">
      <div className="flex flex-wrap gap-2">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-1 text-xs inline-flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-amber-500" />
          <span className="text-amber-700 dark:text-amber-400 font-medium">Требуется подтверждение</span>
        </div>
      </div>
      
      <div className="rounded-md bg-background/50 border border-amber-500/20 overflow-hidden">
        <div className="bg-amber-500/5 px-3 py-1.5 border-b border-amber-500/10">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium text-xs text-amber-700 dark:text-amber-400">
              {count} действ{count !== 1 ? 'ий' : 'ие'} ожида{count !== 1 ? 'ют' : 'ет'} подтверждения
            </span>
          </div>
        </div>
        
        <div className="p-2 text-xs">
          <p className="text-muted-foreground">
            Для продолжения необходимо подтвердить или отклонить запрошенные действия.
          </p>
          <button 
            onClick={openPendingCallsPanel}
            className="mt-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            Показать ожидающие действия
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for futuristic task creation message by AI
const TaskCreationMessage = ({ functions }: { functions: ExecutedFunction[] | undefined }) => {
  if (!functions || functions.length === 0) return null;
  
  // Filter to only get task creation functions
  const taskCreations = functions.filter(fn => fn.function === 'create_task');
  if (taskCreations.length === 0) return null;
  
  // Helper function to safely check if a property exists and is a string or can be converted to string
  const safeGetString = (obj: Record<string, unknown>, key: string): string | null => {
    if (obj[key] !== undefined && obj[key] !== null) {
      return String(obj[key]);
    }
    return null;
  };
  
  return (
    <div className="mt-4 space-y-3">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-1">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-wide text-sm">AI ASSISTANT</span>
          </div>
          <div className="bg-white/20 px-2 py-0.5 rounded-full">
            <span className="text-white text-xs">Task Created</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {taskCreations.map((fn, index) => {
            const title = fn.result.title || 'Untitled Task';
            const description = safeGetString(fn.args, 'description');
            const priority = safeGetString(fn.args, 'priority');
            const dueDate = safeGetString(fn.args, 'dueDate');
            
            return (
              <div key={index} className="bg-white/10 rounded-md backdrop-blur-sm p-3 border border-white/20">
                <h4 className="text-white font-medium mb-2">{title}</h4>
                {description && (
                  <p className="text-white/80 text-xs mb-2">{description}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  {priority && (
                    <div className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-medium ${
                      priority.toLowerCase() === 'high' 
                        ? 'bg-red-500/30 text-white' 
                        : priority.toLowerCase() === 'medium'
                          ? 'bg-amber-500/30 text-white' 
                          : 'bg-blue-500/30 text-white'
                    }`}>
                      {priority}
                    </div>
                  )}
                  {dueDate && (
                    <div className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white">
                      Due: {dueDate}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
          <div className="text-xs text-white/70">Added to your task list</div>
          <div className="animate-pulse">
            <div className="h-2 w-2 bg-emerald-400 rounded-full inline-block mr-1"></div>
            <span className="text-xs text-emerald-300 font-medium">COMPLETE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Message = ({ message }: MessageProps) => {
  // Check if message has executed functions to highlight it
  const hasFunctions = !message.isUser && message.executedFunctions && message.executedFunctions.length > 0;
  const hasPendingCalls = !message.isUser && message.hasPendingCalls && message.pendingCallsCount;
  
  // Check if this is a task creation message
  const hasTaskCreation = !message.isUser && message.executedFunctions && 
    message.executedFunctions.some(fn => fn.function === 'create_task');
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 mb-4 max-w-[90%]",
        message.isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        message.isUser 
          ? "bg-primary" 
          : hasTaskCreation
            ? "bg-gradient-to-r from-blue-600 to-indigo-600" // Futuristic gradient for task creation
            : hasFunctions
              ? "bg-emerald-500" // Green for function execution
              : hasPendingCalls
                ? "bg-amber-500" // Amber for pending approvals
                : "bg-secondary/50" // Default assistant color
      )}>
        {message.isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-foreground" />
        )}
      </div>
      
      <div>
        <div className={cn(
          "p-3 rounded-lg text-sm",
          message.isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : hasTaskCreation
              ? "bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border border-blue-500/20 rounded-tl-none" // Gradient background for task creation
              : hasFunctions
                ? "bg-emerald-500/10 border border-emerald-500/30 rounded-tl-none" // Green tint for function messages
                : hasPendingCalls
                  ? "bg-amber-500/10 border border-amber-500/30 rounded-tl-none" // Amber tint for pending approvals
                  : "bg-secondary/20 border border-border rounded-tl-none" // Default assistant style
        )}>
          {/* Add badge for function execution */}
          {hasFunctions && !hasTaskCreation && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-emerald-500/20">
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                Actions Performed
              </span>
            </div>
          )}
          
          {/* Add badge for task creation */}
          {hasTaskCreation && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-500/20">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                <Bot className="h-3 w-3" />
                <span>AI Task Created</span>
              </span>
            </div>
          )}
          
          {/* Add badge for pending approvals */}
          {hasPendingCalls && !hasFunctions && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-500/20">
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                Approval Needed
              </span>
            </div>
          )}
          
          {message.content}

          {!message.isUser && (
            <>
              {hasTaskCreation ? (
                <TaskCreationMessage functions={message.executedFunctions} />
              ) : (
                <>
                  {message.executedFunctions && message.executedFunctions.length > 0 && 
                    <ExecutedFunctions functions={message.executedFunctions} />
                  }
                </>
              )}
              
              {message.hasPendingCalls && message.pendingCallsCount && 
                <PendingCallsNotification count={message.pendingCallsCount} />
              }
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

const LoadingIndicator = ({ type }: { type: 'thinking' | 'generating' | 'analyzing' }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
      <Bot className="h-4 w-4 text-foreground" />
    </div>
    
    <div className="bg-secondary/20 p-3 rounded-lg border border-border rounded-tl-none">
      <div className="flex items-center gap-2">
        <div className="flex">
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce mx-1" style={{ animationDelay: '300ms' }} />
          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
        </div>
        <span className="text-sm text-muted-foreground ml-1">
          {type === 'thinking' ? 'Thinking...' : 
           type === 'generating' ? 'Generating tasks...' : 
           'Analyzing productivity...'}
        </span>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ error, onDismiss }: { error: string; onDismiss: () => void }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
      <CircleAlert className="h-4 w-4 text-destructive" />
    </div>
    
    <div className="flex-1">
      <div className="bg-destructive/10 p-3 rounded-lg border border-destructive text-destructive text-sm rounded-tl-none">
        <p>Error: {error}</p>
        <button 
          onClick={onDismiss}
          className="text-xs mt-2 text-destructive hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
);

interface ChatMessagesProps {
  scrollToBottom: () => void;
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ scrollToBottom }, ref) => {
    const { 
      messages, 
      isLoading, 
      error, 
      isGeneratingTasks,
      isAnalyzing,
      clearError
    } = useAssistantStore();
    
    const bottomRef = useRef<HTMLDivElement>(null);
    
    // Convert the store messages to the component's message format
    const mapMessages = (messages: AssistantMessage[]) => {
      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.role === 'user',
        timestamp: msg.timestamp,
        executedFunctions: msg.executedFunctions,
        hasPendingCalls: msg.hasPendingCalls,
        pendingCallsCount: msg.pendingCallsCount
      }));
    };
    
    // Auto-scroll to bottom on new messages
    useEffect(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      scrollToBottom();
    }, [messages, isLoading, error, scrollToBottom]);
    
    return (
      <div ref={ref} className="space-y-1 px-4">
        {mapMessages(messages).map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isLoading && <LoadingIndicator type="thinking" />}
        {isGeneratingTasks && <LoadingIndicator type="generating" />}
        {isAnalyzing && <LoadingIndicator type="analyzing" />}
        
        {error && <ErrorMessage error={error} onDismiss={clearError} />}
        
        <div ref={bottomRef} />
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages'; 