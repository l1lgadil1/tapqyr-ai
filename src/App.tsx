import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./app/providers/theme-provider";
import { I18nProvider } from "./app/providers/i18n-provider";
import { AuthProvider } from "./app/providers/auth-provider";
import { BackgroundEffects } from "./shared/ui/background-effects";
import { Header } from "./widgets/header";
import { Footer } from "./widgets/footer";
import { ErrorBoundary } from "./shared/ui/error-boundary";
import { OnboardingModal, UserContextModal, useUserContextModal, UserOnboardingAuthConnector } from "./features/user-onboarding";
import { useEffect } from "react";
import { useUserOnboardingStore } from "./features/user-onboarding";
import { HelmetProvider } from "react-helmet-async";
import { useTranslation } from 'react-i18next';
import { Toaster } from "./shared/ui/toaster";
import { SplitLayout } from "./widgets/layout";

function App() {
  const { loadUserContext, userId } = useUserOnboardingStore();
  const { isOpen, setIsOpen } = useUserContextModal();
  const { i18n } = useTranslation();
  
  // Load user context on mount if user ID exists
  useEffect(() => {
    const loadContext = async () => {
      if (userId) {
        console.log('App: Loading user context on mount');
        try {
          await loadUserContext();
          console.log('App: User context loaded successfully');
        } catch (error) {
          console.error('App: Error loading user context:', error);
        }
      }
    };
    
    loadContext();
  }, [userId, loadUserContext]);
  
  if (!i18n.isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <I18nProvider>
          <ThemeProvider defaultTheme="dark" storageKey="ai-todo-theme">
            <AuthProvider>
              {/* Auth connector to sync user IDs */}
              <UserOnboardingAuthConnector />
              
              <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
                <BackgroundEffects />
                
                <main className="flex-1 flex overflow-hidden relative">
                  <ErrorBoundary>
                    <SplitLayout>
                      <div className="flex flex-col flex-1 h-full">
                        <Header />
                        <div className="flex-1 overflow-auto">
                          <div className="container mx-auto p-4 md:p-6">
                            <Outlet />
                          </div>
                        </div>
                      </div>
                    </SplitLayout>
                  </ErrorBoundary>
                </main>
                
                <Footer />
                
                {/* User Onboarding Modal */}
                <OnboardingModal />
                
                {/* User Context Modal */}
                <UserContextModal open={isOpen} onOpenChange={setIsOpen} />

                {/* Toast Notifications */}
                <Toaster />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
