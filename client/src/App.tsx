import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Reader from "@/pages/reader";
import Library from "@/pages/library";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/layout/bottom-navigation";
import AppHeader from "@/components/layout/app-header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reader/:mangaId/:chapterId" component={Reader} />
      <Route path="/library" component={Library} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-bgDark text-slate-50 font-inter">
          <AppHeader />
          <main className="pb-20">
            <Router />
          </main>
          <BottomNavigation />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
