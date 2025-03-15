import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../shared/ui/button';
import { Sparkles, Loader2, Zap, Lightbulb, Brain, X } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { Textarea } from '../../../shared/ui/textarea';
import { useTranslation } from '../../../shared/lib/i18n';
import { CustomTooltip } from '../../../shared/ui/custom-tooltip';

interface AIPromptProps {
  onAddTodos: (prompt: string) => Promise<void>;
  className?: string;
}

const EXAMPLE_PROMPTS = [
  'Create a marketing plan for my new product launch',
  'Help me organize my home office',
  'Plan a weekend trip to New York',
  'Create a learning path for mastering React',
  'Develop a fitness routine for weight loss'
];

export function AIPrompt({ onAddTodos, className }: AIPromptProps) {
  const { t } = useTranslation('todo');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading) return;
    
    try {
      setError('');
      setIsLoading(true);
      await onAddTodos(prompt);
      setPrompt('');
    } catch (error) {
      console.error('Error generating AI tasks:', error);
      setError(t('aiPrompt.error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExampleClick = (example: string) => {
    setPrompt(example);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const handleClearPrompt = () => {
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  return (
    <motion.div 
      className={cn(
        'relative rounded-lg overflow-hidden futuristic-border transition-all duration-300 w-full mx-auto',
        isExpanded ? 'shadow-lg' : '',
        className
      )}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-30 pointer-events-none" />
      
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-20 h-20 rounded-full bg-primary/10 blur-xl"
          animate={{ 
            x: [0, 100, 50, 200, 0],
            y: [0, 50, 100, 50, 0],
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-accent/10 blur-xl"
          animate={{ 
            x: [0, -100, -50, -150, 0],
            y: [0, -30, -70, -30, 0],
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <form onSubmit={handleSubmit} className="relative z-10 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold ai-text-gradient">{t('aiPrompt.title')}</h3>
          </div>
          
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError('');
              }}
              placeholder={t('aiPrompt.placeholder')}
              className="min-h-[120px] md:min-h-[150px] lg:min-h-[180px] w-full bg-background/50 border-primary/20 focus:border-primary/50 pr-10 text-base md:text-lg"
              onFocus={() => setIsExpanded(true)}
              onBlur={() => setIsExpanded(false)}
              disabled={isLoading}
            />
            {prompt && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleClearPrompt}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-500 text-sm flex items-center"
            >
              <Zap className="h-4 w-4 mr-2" />
              {error}
            </motion.div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="text-sm">
              <p className="text-muted-foreground flex items-center">
                <Lightbulb className="h-4 w-4 mr-1 text-amber-400" />
                {t('aiPrompt.examplePromptsLabel')}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {EXAMPLE_PROMPTS.map((examplePrompt, index) => (
                  <CustomTooltip 
                    key={index}
                    content={
                      <div>
                        <p>{examplePrompt}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('aiPrompt.clickToUse')}</p>
                      </div>
                    }
                  >
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="text-xs bg-background/40 border-primary/10 hover:border-primary/30 hover:bg-background/60"
                      onClick={() => handleExampleClick(examplePrompt)}
                      disabled={isLoading}
                    >
                      {examplePrompt.length > 20 ? `${examplePrompt.substring(0, 20)}...` : examplePrompt}
                    </Button>
                  </CustomTooltip>
                ))}
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !prompt.trim()} 
              className="sm:self-end ai-glow ai-border"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('aiPrompt.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('aiPrompt.generateTasks')}
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
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <Zap className="h-12 w-12 text-primary animate-pulse-glow mx-auto" />
                </motion.div>
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-slow" />
              </div>
              <h3 className="mt-4 text-xl font-semibold ai-text-gradient">{t('aiPrompt.aiWorking')}</h3>
              <p className="text-muted-foreground mt-2">{t('aiPrompt.generatingTasks')}</p>
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