import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Investigation, Activity } from "@shared/schema";

export default function WorkflowPanel() {
  const { data: investigations = [], isLoading: investigationsLoading } = useQuery<Investigation[]>({
    queryKey: ["/api/investigations"],
    refetchInterval: 30000,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 15000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-900 text-red-300";
      case "in_progress": return "bg-yellow-900 text-yellow-300";
      case "open": return "bg-blue-900 text-blue-300";
      default: return "bg-gray-900 text-gray-300";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Investigations */}
      <Card className="bg-dark-900 border-dark-800">
        <CardHeader className="border-b border-dark-800">
          <CardTitle className="text-lg font-semibold text-white">
            Active Investigations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {investigationsLoading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-dark-800 rounded-lg"></div>
              </div>
            ))
          ) : investigations.length === 0 ? (
            <div className="text-center text-dark-400 py-4">
              No active investigations
            </div>
          ) : (
            investigations.slice(0, 3).map((investigation: Investigation) => (
              <div key={investigation.id} className="p-3 bg-dark-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium text-sm">
                    {investigation.title}
                  </h4>
                  <Badge className={getStatusColor(investigation.priority)} variant="secondary">
                    {investigation.status === "in_progress" ? "In Progress" : investigation.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-sm text-dark-400">
                    <span>Assigned to:</span>
                    <span className="text-white">
                      {investigation.assignedTo ? `@${investigation.assignedTo}` : "Unassigned"}
                    </span>
                  </div>
                  <span className="text-dark-400 text-xs">
                    {formatDistanceToNow(new Date(investigation.updatedAt || new Date()), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Team Activity */}
      <Card className="bg-dark-900 border-dark-800">
        <CardHeader className="border-b border-dark-800">
          <CardTitle className="text-lg font-semibold text-white">
            Team Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {activitiesLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-dark-800 rounded-lg"></div>
              </div>
            ))
          ) : activities.length === 0 ? (
            <div className="text-center text-dark-400 py-4">
              No recent activity
            </div>
          ) : (
            activities.slice(0, 5).map((activity: Activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-medium">
                    {activity.userId.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-medium">User</span>{" "}
                    <span className="text-dark-300">
                      {activity.action.replace("_", " ")} {activity.entityType}
                    </span>
                  </p>
                  <p className="text-xs text-dark-400">
                    {formatDistanceToNow(new Date(activity.createdAt || new Date()), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
