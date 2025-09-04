import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Practice from "@/pages/practice";
import Review from "@/pages/review";
import TestPapers from "@/pages/test-papers";
import AppHeader from "@/components/app-header";

function Router() {
  return (
    <>
      <AppHeader />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/practice" component={Practice} />
        <Route path="/practice/:unitId" component={Practice} />
        <Route path="/practice/test-paper/:testPaperId" component={Practice} />
        <Route path="/practice/review" component={Practice} />
        <Route path="/test-papers/:unitId" component={TestPapers} />
        <Route path="/review" component={Review} />
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
