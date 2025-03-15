import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./app/providers/theme-provider";
import { I18nProvider } from "./app/providers/i18n-provider";
import { BackgroundEffects } from "./shared/ui/background-effects";
import { Header } from "./widgets/header";
import { Footer } from "./widgets/footer";
import { AIAssistant } from "./features/ai-assistant";
import { useAIAssistantStore } from "./features/ai-assistant/model";
import { cn, useIsDesktop } from "./shared/lib/utils";
import { ErrorBoundary } from "./shared/ui/error-boundary";

function App() {
  const { isOpen, isMinimized } = useAIAssistantStore();
  const isDesktop = useIsDesktop();
  
  // Calculate main content padding based on AI assistant state
  const shouldAdjustLayout = isDesktop && isOpen && !isMinimized;
  
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider defaultTheme="dark" storageKey="ai-todo-theme">
          <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            <BackgroundEffects />
            <Header />
            
            <main className={cn(
              "flex-1 transition-all duration-300",
              shouldAdjustLayout && "ml-[320px]"
            )}>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>
            
            <Footer className={cn(
              "transition-all duration-300",
              shouldAdjustLayout && "ml-[320px]"
            )} />
            
            {/* AI Assistant */}
            <AIAssistant />
          </div>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
