import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Practice from "@/pages/practice";
import Review from "@/pages/review";
import TestPapers from "@/pages/test-papers";
import AppHeader from "@/components/app-header";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {!isLoading && isAuthenticated && <AppHeader />}
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
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
