import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { AccessibilityMenu } from "@/components/accessibility-menu";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import MessageThread from "@/pages/message-thread";
import Login from "@/pages/login";
import { useState, useEffect } from "react";

function Router() {
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedWhisperingNetwork');
    if (hasVisited) {
      setShowLanding(false);
    }
  }, []);

  const handleEnterApp = () => {
    localStorage.setItem('hasVisitedWhisperingNetwork', 'true');
    setShowLanding(false);
  };

  if (showLanding) {
    return <Landing onEnter={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin" component={Admin} />
        <Route path="/message/:id" component={MessageThread} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen">
            <AccessibilityMenu />
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
