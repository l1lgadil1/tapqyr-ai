import { FC, useEffect, useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { useUserOnboardingStore } from '../model/store';
import { useUserContextModal } from '../model/use-user-context-modal';
import { OnboardingModal } from './onboarding-modal';
import { UserContextModal } from './user-context-modal';
import { userApiService } from '../../../shared/api/api-service';
import { UserContext } from '../../../shared/api/user-api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Badge } from '../../../shared/ui/badge';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

/**
 * Debug component to test user context functionality
 */
export const DebugUserContext: FC = () => {
  const {
    userId,
    email,
    isOnboardingComplete,
    workDescription,
    shortTermGoals,
    longTermGoals,
    otherContext,
    setOnboardingModalOpen,
    initializeUser,
    loadUserContext
  } = useUserOnboardingStore();

  const { isOpen, setIsOpen, openModal, canShowContextModal } = useUserContextModal();
  const [tempEmail, setTempEmail] = useState(`user_${Date.now()}@example.com`);
  const [backendUser, setBackendUser] = useState<UserContext | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);

  // Log state changes
  useEffect(() => {
    console.log('DebugUserContext: State updated', {
      userId,
      email,
      isOnboardingComplete,
      hasContext: !!(workDescription || shortTermGoals || longTermGoals || otherContext),
      canShowContextModal
    });
  }, [userId, email, isOnboardingComplete, workDescription, shortTermGoals, longTermGoals, otherContext, canShowContextModal]);

  // Load backend user data when userId changes
  useEffect(() => {
    const loadBackendUser = async () => {
      if (!userId) {
        setBackendUser(null);
        return;
      }

      setIsLoadingBackend(true);
      setBackendError(null);

      try {
        const user = await userApiService.getUserById(userId);
        setBackendUser(user);
      } catch (error) {
        console.error('Error loading backend user:', error);
        setBackendError('Failed to load user from backend');
        setBackendUser(null);
      } finally {
        setIsLoadingBackend(false);
      }
    };

    loadBackendUser();
  }, [userId]);

  const handleCreateUser = () => {
    initializeUser(tempEmail);
  };

  const handleLoadContext = () => {
    if (userId) {
      loadUserContext();
    } else {
      alert('No user ID available. Create a user first.');
    }
  };

  const handleOpenOnboarding = () => {
    setOnboardingModalOpen(true);
  };

  const handleOpenContextModal = () => {
    if (canShowContextModal) {
      openModal();
    } else {
      alert('Cannot show context modal. Either onboarding is not complete or no context data exists.');
    }
  };

  const handleRefreshBackend = async () => {
    if (!userId) {
      alert('No user ID available. Create a user first.');
      return;
    }

    setIsLoadingBackend(true);
    setBackendError(null);

    try {
      const user = await userApiService.getUserById(userId);
      setBackendUser(user);
    } catch (error) {
      console.error('Error refreshing backend user:', error);
      setBackendError('Failed to refresh user from backend');
    } finally {
      setIsLoadingBackend(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border-2 border-primary/30 shadow-md shadow-primary/10 futuristic-border">
      <CardHeader className="bg-primary/5 border-b border-primary/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-primary ai-text-gradient">User Context Debug</CardTitle>
          <Badge variant={backendUser ? "success" : "destructive"} className={backendUser ? "bg-green-600 hover:bg-green-700" : "bg-destructive/90 hover:bg-destructive"}>
            {backendUser ? "Backend Connected" : "No Backend Data"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2 bg-secondary/50">
            <TabsTrigger value="local" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Local State</TabsTrigger>
            <TabsTrigger value="backend" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Backend State</TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="space-y-4 pt-4 border border-secondary/50 rounded-md p-4 bg-card/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1 text-foreground">User ID:</h3>
                <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary">{userId || 'Not set'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1 text-foreground">Email:</h3>
                <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary">{email || 'Not set'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1 text-foreground">Onboarding Complete:</h3>
                <p className={`text-sm p-2 rounded border ${isOnboardingComplete ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>
                  {isOnboardingComplete ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1 text-foreground">Can Show Context Modal:</h3>
                <p className={`text-sm p-2 rounded border ${canShowContextModal ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>
                  {canShowContextModal ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="border-t border-primary/10 pt-4">
              <h3 className="text-sm font-medium mb-2 text-primary">Context Data:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium mb-1 text-foreground">Work Description:</h4>
                  <p className="text-xs bg-secondary/50 p-2 rounded border border-secondary">{workDescription || 'Not set'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium mb-1 text-foreground">Short-term Goals:</h4>
                  <p className="text-xs bg-secondary/50 p-2 rounded border border-secondary">{shortTermGoals || 'Not set'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium mb-1 text-foreground">Long-term Goals:</h4>
                  <p className="text-xs bg-secondary/50 p-2 rounded border border-secondary">{longTermGoals || 'Not set'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium mb-1 text-foreground">Additional Context:</h4>
                  <p className="text-xs bg-secondary/50 p-2 rounded border border-secondary">{otherContext || 'Not set'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backend" className="space-y-4 pt-4 border border-secondary/50 rounded-md p-4 bg-card/50">
            {backendError && (
              <div className="bg-destructive/20 text-destructive p-4 rounded-md mb-4 border border-destructive/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">{backendError}</span>
                </div>
              </div>
            )}
            
            {isLoadingBackend ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : backendUser ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1 text-foreground">Backend User ID:</h3>
                    <p className="text-sm bg-secondary/50 p-2 rounded border border-secondary">{backendUser.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 text-foreground">Onboarding Complete:</h3>
                    <p className={`text-sm p-2 rounded border ${backendUser.onboardingComplete ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>
                      {backendUser.onboardingComplete ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-primary/10 pt-4">
                  <h3 className="text-sm font-medium mb-2 text-primary">Backend Context Data:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium mb-1 text-foreground">Work Description:</h4>
                      <div className="flex items-center gap-2">
                        {backendUser.workDescription === null && 
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        }
                        <p className={`text-xs p-2 rounded border flex-1 ${
                          backendUser.workDescription === null 
                            ? 'bg-destructive/10 text-destructive border-destructive/30' 
                            : 'bg-secondary/50 border-secondary'
                        }`}>
                          {backendUser.workDescription === null ? 'NULL' : (backendUser.workDescription || 'Empty string')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium mb-1 text-foreground">Short-term Goals:</h4>
                      <div className="flex items-center gap-2">
                        {backendUser.shortTermGoals === null && 
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        }
                        <p className={`text-xs p-2 rounded border flex-1 ${
                          backendUser.shortTermGoals === null 
                            ? 'bg-destructive/10 text-destructive border-destructive/30' 
                            : 'bg-secondary/50 border-secondary'
                        }`}>
                          {backendUser.shortTermGoals === null ? 'NULL' : (backendUser.shortTermGoals || 'Empty string')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium mb-1 text-foreground">Long-term Goals:</h4>
                      <div className="flex items-center gap-2">
                        {backendUser.longTermGoals === null && 
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        }
                        <p className={`text-xs p-2 rounded border flex-1 ${
                          backendUser.longTermGoals === null 
                            ? 'bg-destructive/10 text-destructive border-destructive/30' 
                            : 'bg-secondary/50 border-secondary'
                        }`}>
                          {backendUser.longTermGoals === null ? 'NULL' : (backendUser.longTermGoals || 'Empty string')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium mb-1 text-foreground">Additional Context:</h4>
                      <div className="flex items-center gap-2">
                        {backendUser.otherContext === null && 
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        }
                        <p className={`text-xs p-2 rounded border flex-1 ${
                          backendUser.otherContext === null 
                            ? 'bg-destructive/10 text-destructive border-destructive/30' 
                            : 'bg-secondary/50 border-secondary'
                        }`}>
                          {backendUser.otherContext === null ? 'NULL' : (backendUser.otherContext || 'Empty string')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleRefreshBackend} 
                    variant="outline" 
                    size="sm"
                    className="border-primary/50 hover:bg-primary/20 hover:text-primary"
                  >
                    {isLoadingBackend ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh Backend Data
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No backend data available</p>
                {userId && (
                  <Button 
                    onClick={handleRefreshBackend} 
                    variant="outline" 
                    size="sm"
                    className="border-primary/50 hover:bg-primary/20 hover:text-primary"
                  >
                    {isLoadingBackend ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Try to Load Backend Data
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t border-primary/20 pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button 
              onClick={handleCreateUser}
              className="bg-primary hover:bg-primary/90"
            >
              Create User
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              onClick={handleLoadContext} 
              disabled={!userId}
              variant="outline"
              className="border-primary/50 hover:bg-primary/20 hover:text-primary"
            >
              Load Context
            </Button>
            <Button 
              onClick={handleOpenOnboarding} 
              variant="outline"
              className="border-primary/50 hover:bg-primary/20 hover:text-primary"
            >
              Open Onboarding
            </Button>
            <Button 
              onClick={handleOpenContextModal} 
              disabled={!canShowContextModal}
              variant="outline"
              className="border-primary/50 hover:bg-primary/20 hover:text-primary col-span-2"
            >
              Open Context Modal
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Modals */}
      <OnboardingModal />
      <UserContextModal open={isOpen} onOpenChange={setIsOpen} />
    </Card>
  );
}; 