'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/ui/card';
import { useUserOnboardingStore } from '../../features/user-onboarding/model/store';
import { userApiService } from '../../shared/api/api-service';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { UserContext } from '../../shared/api/user-api';

export default function DebugPage() {
  const {
    userId,
    email,
    workDescription: storeWorkDescription,
    shortTermGoals: storeShortTermGoals,
    longTermGoals: storeLongTermGoals,
    otherContext: storeOtherContext,
    isOnboardingComplete,
    loadUserContext,
    initializeUser
  } = useUserOnboardingStore();

  const [backendData, setBackendData] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fixAttempted, setFixAttempted] = useState(false);

  // Fetch backend data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Try to get user context
        try {
          const data = await userApiService.getUserContext(userId);
          setBackendData(data);
          console.log('Debug: Successfully fetched user context', data);
        } catch (contextError) {
          console.error('Error fetching user context, trying to get user by ID', contextError);
          
          // If that fails, try to get user by ID
          const userData = await userApiService.getUserById(userId);
          setBackendData(userData);
          console.log('Debug: Successfully fetched user by ID', userData);
        }
      } catch (error) {
        console.error('Error fetching user data from backend:', error);
        setError('Failed to load data from server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, refreshKey]);

  // Check if any context fields are null
  const hasNullFields = backendData && (
    backendData.workDescription === null ||
    backendData.shortTermGoals === null ||
    backendData.longTermGoals === null ||
    backendData.otherContext === null
  );

  // Attempt to fix null fields
  const handleFixNullFields = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    setFixAttempted(true);
    
    try {
      // Update user context with empty strings for null fields
      await userApiService.updateUserContext(userId, {
        workDescription: backendData?.workDescription === null ? '' : backendData?.workDescription,
        shortTermGoals: backendData?.shortTermGoals === null ? '' : backendData?.shortTermGoals,
        longTermGoals: backendData?.longTermGoals === null ? '' : backendData?.longTermGoals,
        otherContext: backendData?.otherContext === null ? '' : backendData?.otherContext,
      });
      
      // Reload user context in store
      await loadUserContext();
      
      // Refresh backend data
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error fixing null fields:', error);
      setError('Failed to fix null fields');
    } finally {
      setIsLoading(false);
    }
  };

  // Reinitialize user
  const handleReinitializeUser = async () => {
    if (!userId || !email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await initializeUser(email);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error reinitializing user:', error);
      setError('Failed to reinitialize user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 bg-gradient-to-b from-background to-background/80">
      <h1 className="text-3xl font-bold mb-6 text-primary ai-text-gradient">User Context Debug</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-primary/30 shadow-md shadow-primary/10 futuristic-border">
          <CardHeader className="bg-primary/5 border-b border-primary/20">
            <CardTitle className="text-primary">Local Store Data</CardTitle>
            <CardDescription>Data from Zustand store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1 text-foreground">User ID</p>
                <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary">{userId || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1 text-foreground">Email</p>
                <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary">{email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1 text-foreground">Onboarding Complete</p>
                <p className={`text-sm p-2 rounded border ${isOnboardingComplete ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>
                  {isOnboardingComplete ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1 text-foreground">Work Description</p>
                <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary whitespace-pre-line">{storeWorkDescription || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1 text-foreground">Short-term Goals</p>
                <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary whitespace-pre-line">{storeShortTermGoals || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1 text-foreground">Long-term Goals</p>
                <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary whitespace-pre-line">{storeLongTermGoals || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1 text-foreground">Other Context</p>
                <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary whitespace-pre-line">{storeOtherContext || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 border-t border-primary/20">
            <Button 
              variant="outline" 
              onClick={() => loadUserContext()}
              disabled={isLoading || !userId}
              className="border-primary/50 hover:bg-primary/20 hover:text-primary"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Reload Store Data
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-2 border-primary/30 shadow-md shadow-primary/10 futuristic-border">
          <CardHeader className="bg-primary/5 border-b border-primary/20">
            <CardTitle className="text-primary">Backend Data</CardTitle>
            <CardDescription>Data from API</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            ) : error ? (
              <div className="py-4">
                <div className="bg-destructive/20 text-destructive p-4 rounded-md mb-4 border border-destructive/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              </div>
            ) : backendData ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1 text-foreground">User ID</p>
                  <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary">{backendData.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-foreground">Onboarding Complete</p>
                  <p className={`text-sm p-2 rounded border ${backendData.onboardingComplete ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>
                    {backendData.onboardingComplete ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-foreground">Work Description</p>
                  <div className="flex items-center gap-2">
                    {backendData.workDescription === null && 
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    }
                    <p className={`text-sm p-2 rounded border flex-1 whitespace-pre-line ${
                      backendData.workDescription === null 
                        ? 'bg-destructive/10 text-destructive border-destructive/30' 
                        : 'bg-secondary/50 border-secondary'
                    }`}>
                      {backendData.workDescription === null ? 'NULL' : (backendData.workDescription || 'Empty string')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-foreground">Short-term Goals</p>
                  <div className="flex items-center gap-2">
                    {backendData.shortTermGoals === null && 
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    }
                    <p className={`text-sm p-2 rounded border flex-1 whitespace-pre-line ${
                      backendData.shortTermGoals === null 
                        ? 'bg-destructive/10 text-destructive border-destructive/30' 
                        : 'bg-secondary/50 border-secondary'
                    }`}>
                      {backendData.shortTermGoals === null ? 'NULL' : (backendData.shortTermGoals || 'Empty string')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-foreground">Long-term Goals</p>
                  <div className="flex items-center gap-2">
                    {backendData.longTermGoals === null && 
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    }
                    <p className={`text-sm p-2 rounded border flex-1 whitespace-pre-line ${
                      backendData.longTermGoals === null 
                        ? 'bg-destructive/10 text-destructive border-destructive/30' 
                        : 'bg-secondary/50 border-secondary'
                    }`}>
                      {backendData.longTermGoals === null ? 'NULL' : (backendData.longTermGoals || 'Empty string')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-foreground">Other Context</p>
                  <div className="flex items-center gap-2">
                    {backendData.otherContext === null && 
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    }
                    <p className={`text-sm p-2 rounded border flex-1 whitespace-pre-line ${
                      backendData.otherContext === null 
                        ? 'bg-destructive/10 text-destructive border-destructive/30' 
                        : 'bg-secondary/50 border-secondary'
                    }`}>
                      {backendData.otherContext === null ? 'NULL' : (backendData.otherContext || 'Empty string')}
                    </p>
                  </div>
                </div>
                
                {hasNullFields && (
                  <div className="mt-4 p-4 bg-amber-100 border-2 border-amber-300 rounded-md dark:bg-amber-900/30 dark:border-amber-700">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Null fields detected</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                          Some context fields have NULL values. This can cause issues with the application.
                          Click the button below to fix these fields.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        onClick={handleFixNullFields} 
                        disabled={isLoading}
                        variant="default"
                        className="bg-amber-600 hover:bg-amber-700 text-white border-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Fixing...
                          </>
                        ) : (
                          <>Fix NULL Fields</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {fixAttempted && !hasNullFields && (
                  <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-md dark:bg-green-900/30 dark:border-green-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Fields fixed successfully</p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          All NULL fields have been replaced with empty strings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No backend data available</p>
                {userId && (
                  <Button 
                    onClick={() => setRefreshKey(prev => prev + 1)} 
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/20 hover:text-primary"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try to Load Data
                  </Button>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between bg-primary/5 border-t border-primary/20">
            <Button 
              onClick={() => setRefreshKey(prev => prev + 1)} 
              disabled={isLoading || !userId}
              variant="outline"
              className="border-primary/50 hover:bg-primary/20 hover:text-primary"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh Data
            </Button>
            
            {userId && email && (
              <Button 
                onClick={handleReinitializeUser} 
                disabled={isLoading}
                variant="secondary"
                className="bg-secondary hover:bg-secondary/80"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Reinitialize User
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 