import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Dock, User, Tag } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Alert } from "@shared/schema";

export default function AlertFeed() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, refetch } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: string }) => {
      const response = await fetch(`/api/alerts/${alertId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update alert status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert status updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update alert status",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-500 bg-opacity-20";
      case "high": return "text-orange-400 bg-orange-500 bg-opacity-20";
      case "medium": return "text-yellow-400 bg-yellow-500 bg-opacity-20";
      case "low": return "text-green-400 bg-green-500 bg-opacity-20";
      default: return "text-blue-400 bg-blue-500 bg-opacity-20";
    }
  };

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-400";
      case "high": return "bg-orange-400";
      case "medium": return "bg-yellow-400";
      case "low": return "bg-green-400";
      default: return "bg-blue-400";
    }
  };

  const filteredAlerts = alerts.filter((alert: Alert) => 
    severityFilter === "all" || alert.severity === severityFilter
  );

  if (isLoading) {
    return (
      <Card className="bg-dark-900 border-dark-800">
        <CardHeader>
          <CardTitle className="text-white">Loading alerts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-dark-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-900 border-dark-800">
      <CardHeader className="border-b border-dark-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            AI-Prioritized Alert Feed
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="bg-dark-800 text-white border-dark-700 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-800 border-dark-700">
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="high">High & Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => refetch()}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-dark-400">
              No alerts match the current filter.
            </div>
          ) : (
            filteredAlerts.map((alert: Alert) => (
              <div
                key={alert.id}
                className="p-4 border-b border-dark-800 hover:bg-dark-800 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 ${getSeverityDot(alert.severity)} rounded-full mt-1`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{alert.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                          {alert.severity}
                        </Badge>
                        <span className="text-dark-400 text-sm">
                          {formatDistanceToNow(new Date(alert.createdAt || new Date()), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-dark-300 text-sm mt-1">
                      {alert.description}
                    </p>
                    {alert.aiSummary && (
                      <p className="text-indigo-300 text-sm mt-1 italic">
                        AI Analysis: {alert.aiSummary}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-sm text-dark-400">
                        <span className="flex items-center">
                          <Dock className="w-4 h-4 mr-1" />
                          {alert.source}
                        </span>
                        {alert.sourceUser && (
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {alert.sourceUser}
                          </span>
                        )}
                        {alert.tags && alert.tags.length > 0 && (
                          <span className="flex items-center">
                            <Tag className="w-4 h-4 mr-1" />
                            {alert.tags.join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                          onClick={() => {
                            updateStatusMutation.mutate({
                              alertId: alert.id,
                              status: "investigating",
                            });
                          }}
                          disabled={updateStatusMutation.isPending}
                        >
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-dark-700 hover:bg-dark-600 border-dark-600 text-xs"
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
