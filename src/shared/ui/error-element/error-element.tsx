import { useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '../button';

export function ErrorElement() {
  const error = useRouteError() as Error;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full p-6 rounded-lg bg-background/80 backdrop-blur-sm border border-destructive/20 shadow-lg">
        <div className="w-16 h-16 mx-auto mb-6 text-destructive">
          <AlertTriangle className="w-full h-full" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Oops! Something went wrong</h1>
        
        <p className="text-muted-foreground text-center mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
} 