import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./app/providers/theme-provider";
import { BackgroundEffects } from "./shared/ui/background-effects";
import { Header } from "./widgets/header";
import { Footer } from "./widgets/footer";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ai-todo-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
        <BackgroundEffects />
        <Header />
        
        <main className="flex-1">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
