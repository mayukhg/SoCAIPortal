import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import KPICards from "@/components/dashboard/KPICards";
import AlertFeed from "@/components/dashboard/AlertFeed";
import WorkflowPanel from "@/components/dashboard/WorkflowPanel";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { lastMessage } = useWebSocket();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === "new_alert") {
          toast({
            title: "New Alert",
            description: `${data.data.severity.toUpperCase()}: ${data.data.title}`,
            variant: data.data.severity === "critical" ? "destructive" : "default",
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-dark-50">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Main Dashboard Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <KPICards />
                <AlertFeed />
                <WorkflowPanel />
              </div>
            </div>
            {/* AI Chat Panel */}
            <AIChatPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
