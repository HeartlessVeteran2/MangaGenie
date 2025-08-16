import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Reader from "@/pages/reader";
import Library from "@/pages/library";
import AnimePage from "@/pages/anime";
import RepositoriesPage from "@/pages/repositories";
import SyncPage from "@/pages/sync";
import DownloadsPage from "@/pages/downloads";
import NotFound from "@/pages/not-found";
import Landing from "@/components/auth/landing";
import BottomNavigation from "@/components/layout/bottom-navigation";
import AppHeader from "@/components/layout/app-header";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/reader/:mangaId/:chapterId" component={Reader} />
          <Route path="/library" component={Library} />
          <Route path="/anime" component={AnimePage} />
          <Route path="/repositories" component={RepositoriesPage} />
          <Route path="/sync" component={SyncPage} />
          <Route path="/downloads" component={DownloadsPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <AuthenticatedApp />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return <Router />;
  }

  return (
    <>
      <AppHeader />
      <main className="pb-20">
        <Router />
      </main>
      <BottomNavigation />
    </>
  );
}

export default App;
