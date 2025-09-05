import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Practice from "@/pages/practice";
import Review from "@/pages/review";
import TestPapers from "@/pages/test-papers";
import AppHeader from "@/components/app-header";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state during initial authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-lg mx-auto"></div>
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <AppHeader />}
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/practice" component={Practice} />
            <Route path="/practice/:unitId" component={Practice} />
            <Route path="/practice/test-paper/:testPaperId" component={Practice} />
            <Route path="/practice/review" component={Practice} />
            <Route path="/test-papers/:unitId" component={TestPapers} />
            <Route path="/review" component={Review} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
