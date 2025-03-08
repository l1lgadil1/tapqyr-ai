import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../shared/ui/button';
import { Sparkles, Loader2, Zap } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { Textarea } from '../../../shared/ui/textarea';

interface AIPromptProps {
  onAddTodos: (prompt: string) => Promise<void>;
  className?: string;
}

export function AIPrompt({ onAddTodos, className }: AIPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      await onAddTodos(prompt);
      setPrompt('');
    } catch (error) {
      console.error('Error generating AI tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div 
      className={cn(
        'relative rounded-lg overflow-hidden futuristic-border transition-all duration-300',
        isExpanded ? 'shadow-lg' : '',
        className
      )}
      layout
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-30 pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="relative z-10 p-6">
        <div className="flex flex-col space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to accomplish, and our AI will generate a structured set of tasks to help you achieve your goal."
            className="min-h-[120px] bg-background/50 border-primary/20 focus:border-primary/50"
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setIsExpanded(false)}
          />
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Example prompts:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Create a marketing plan for my new product launch</li>
                <li>Help me organize my home office</li>
                <li>Plan a weekend trip to New York</li>
              </ul>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !prompt.trim()} 
              className="sm:self-end ai-glow ai-border"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20"
          >
            <div className="text-center">
              <div className="relative">
                <Zap className="h-12 w-12 text-primary animate-pulse-glow mx-auto" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-slow" />
              </div>
              <h3 className="mt-4 text-xl font-semibold ai-text-gradient">AI is working...</h3>
              <p className="text-muted-foreground mt-2">Generating tasks based on your prompt</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scanning line effect */}
      {isExpanded && (
        <motion.div 
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          initial={{ top: '0%', opacity: 0 }}
          animate={{ 
            top: '100%', 
            opacity: [0, 1, 0],
            transition: { 
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'linear'
            }
          }}
        />
      )}
    </motion.div>
  );
} 