import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { User, Alert } from "@shared/schema";

export default function TeamManagement() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock team data - in production this would come from API
  const teamMembers: User[] = [
    {
      id: "1",
      email: "alice.johnson@company.com",
      firstName: "Alice",
      lastName: "Johnson",
      role: "tier3",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b5c8?w=100&h=100&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2", 
      email: "bob.smith@company.com",
      firstName: "Bob",
      lastName: "Smith",
      role: "tier2",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "3",
      email: "carol.davis@company.com", 
      firstName: "Carol",
      lastName: "Davis",
      role: "tier1",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "4",
      email: "david.wilson@company.com",
      firstName: "David", 
      lastName: "Wilson",
      role: "manager",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "manager": return "bg-purple-900 text-purple-300";
      case "tier3": return "bg-red-900 text-red-300";
      case "tier2": return "bg-yellow-900 text-yellow-300";
      case "tier1": return "bg-blue-900 text-blue-300";
      default: return "bg-gray-900 text-gray-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "manager": return "SOC Manager";
      case "tier3": return "Tier 3 Analyst";
      case "tier2": return "Tier 2 Analyst";
      case "tier1": return "Tier 1 Analyst";
      default: return "Analyst";
    }
  };

  const getUserWorkload = (userId: string) => {
    return alerts.filter(alert => alert.assignedTo === userId).length;
  };

  const assignAlertMutation = useMutation({
    mutationFn: async ({ alertId, userId }: { alertId: string; userId: string }) => {
      const response = await fetch(`/api/alerts/${alertId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to assign alert");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert assigned successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign alert",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Team Overview */}
      <Card className="lg:col-span-2 bg-dark-900 border-dark-800">
        <CardHeader className="border-b border-dark-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-400" />
              SOC Team ({teamMembers.length})
            </CardTitle>
            {currentUser?.role === "manager" && (
              <Button
                size="sm"
                onClick={() => setShowAddUser(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add Member
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => {
              const workload = getUserWorkload(member.id);
              const isOnline = Math.random() > 0.3; // Mock online status
              
              return (
                <div
                  key={member.id}
                  className={`bg-dark-800 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedUser === member.id ? "ring-2 ring-indigo-500" : "hover:bg-dark-700"
                  }`}
                  onClick={() => setSelectedUser(selectedUser === member.id ? null : member.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.profileImageUrl || ""} />
                        <AvatarFallback className="bg-indigo-600 text-white">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-dark-800 ${
                        isOnline ? "bg-green-400" : "bg-gray-400"
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium">
                        {member.firstName} {member.lastName}
                      </h4>
                      <p className="text-dark-400 text-sm truncate">
                        {member.email}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getRoleColor(member.role)} variant="secondary">
                        {getRoleLabel(member.role).replace("SOC ", "").replace(" Analyst", "")}
                      </Badge>
                      <p className="text-dark-400 text-xs mt-1">
                        {workload} active alerts
                      </p>
                    </div>
                  </div>
                  
                  {selectedUser === member.id && (
                    <div className="mt-4 pt-4 border-t border-dark-700">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-dark-400">Status:</span>
                          <span className={`ml-2 ${isOnline ? "text-green-400" : "text-gray-400"}`}>
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                        <div>
                          <span className="text-dark-400">Workload:</span>
                          <span className={`ml-2 ${workload > 5 ? "text-red-400" : workload > 2 ? "text-yellow-400" : "text-green-400"}`}>
                            {workload > 5 ? "High" : workload > 2 ? "Medium" : "Low"}
                          </span>
                        </div>
                        <div>
                          <span className="text-dark-400">Last Activity:</span>
                          <span className="text-white ml-2">
                            {Math.floor(Math.random() * 30) + 1}m ago
                          </span>
                        </div>
                        <div>
                          <span className="text-dark-400">Shift:</span>
                          <span className="text-white ml-2">
                            {new Date().getHours() < 16 ? "Day" : "Night"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline" className="border-dark-600 text-dark-300 hover:bg-dark-700">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                        {currentUser?.role === "manager" && (
                          <Button size="sm" variant="outline" className="border-dark-600 text-dark-300 hover:bg-dark-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Assign Alert
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Stats & Quick Actions */}
      <Card className="bg-dark-900 border-dark-800">
        <CardHeader className="border-b border-dark-800">
          <CardTitle className="text-lg font-semibold text-white">
            Team Statistics
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Role Distribution */}
          <div>
            <h4 className="text-white font-medium mb-3">Role Distribution</h4>
            <div className="space-y-2">
              {["manager", "tier3", "tier2", "tier1"].map((role) => {
                const count = teamMembers.filter(m => m.role === role).length;
                const percentage = (count / teamMembers.length) * 100;
                
                return (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-dark-400 text-sm">
                      {getRoleLabel(role)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm w-6">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workload Distribution */}
          <div>
            <h4 className="text-white font-medium mb-3">Workload Status</h4>
            <div className="space-y-3">
              <div className="bg-dark-800 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">Available:</span>
                  <span className="text-green-400">
                    {teamMembers.filter(m => getUserWorkload(m.id) < 3).length}
                  </span>
                </div>
              </div>
              <div className="bg-dark-800 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">Busy:</span>
                  <span className="text-yellow-400">
                    {teamMembers.filter(m => getUserWorkload(m.id) >= 3 && getUserWorkload(m.id) < 6).length}
                  </span>
                </div>
              </div>
              <div className="bg-dark-800 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">Overloaded:</span>
                  <span className="text-red-400">
                    {teamMembers.filter(m => getUserWorkload(m.id) >= 6).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {currentUser?.role === "manager" && (
            <div>
              <h4 className="text-white font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Users className="w-4 h-4 mr-2" />
                  Balance Workload
                </Button>
                <Button size="sm" variant="outline" className="w-full border-dark-600 text-dark-300 hover:bg-dark-700">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button size="sm" variant="outline" className="w-full border-dark-600 text-dark-300 hover:bg-dark-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Broadcast
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}