import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Eye, Zap, Network, Users } from "lucide-react";
import type { Alert } from "@shared/schema";

export default function ThreatGraphPanel() {
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // Group alerts by source and correlate threats
  const threatNodes = alerts.reduce((acc: any, alert) => {
    const sourceKey = alert.source;
    if (!acc[sourceKey]) {
      acc[sourceKey] = {
        id: sourceKey,
        name: sourceKey,
        type: "endpoint",
        alertCount: 0,
        severityLevel: 0,
        connections: [],
        lastActivity: alert.createdAt,
      };
    }
    acc[sourceKey].alertCount++;
    
    // Calculate severity weight
    const severityWeight = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1
    }[alert.severity] || 1;
    
    acc[sourceKey].severityLevel = Math.max(acc[sourceKey].severityLevel, severityWeight);
    return acc;
  }, {});

  const nodes = Object.values(threatNodes);

  const getSeverityColor = (level: number) => {
    if (level >= 5) return "text-red-400 bg-red-500 bg-opacity-20 border-red-500";
    if (level >= 4) return "text-orange-400 bg-orange-500 bg-opacity-20 border-orange-500";
    if (level >= 3) return "text-yellow-400 bg-yellow-500 bg-opacity-20 border-yellow-500";
    if (level >= 2) return "text-green-400 bg-green-500 bg-opacity-20 border-green-500";
    return "text-blue-400 bg-blue-500 bg-opacity-20 border-blue-500";
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "endpoint": return Network;
      case "user": return Users;
      case "threat": return Zap;
      default: return Eye;
    }
  };

  return (
    <Card className="bg-dark-900 border-dark-800">
      <CardHeader className="border-b border-dark-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-indigo-400" />
            Threat Correlation Graph
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="bg-dark-800 text-white border-dark-700 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-800 border-dark-700">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Eye className="w-4 h-4 mr-1" />
              Analyze
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-lg p-4 h-80 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20"></div>
              
              {/* Simulated network nodes */}
              <div className="relative h-full flex items-center justify-center">
                <div className="grid grid-cols-3 gap-8 w-full max-w-md">
                  {nodes.slice(0, 9).map((node: any, index) => {
                    const Icon = getNodeIcon(node.type);
                    return (
                      <div
                        key={node.id}
                        className={`relative cursor-pointer transform transition-all duration-200 hover:scale-110 ${
                          selectedNode === node.id ? "scale-110" : ""
                        }`}
                        onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                      >
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getSeverityColor(node.severityLevel)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Connection lines to center */}
                        <svg className="absolute inset-0 w-12 h-12 pointer-events-none">
                          <line
                            x1="24"
                            y1="24"
                            x2={index % 3 === 1 ? "24" : index % 3 === 0 ? "48" : "0"}
                            y2={Math.floor(index / 3) === 1 ? "24" : Math.floor(index / 3) === 0 ? "48" : "0"}
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-dark-600 opacity-50"
                          />
                        </svg>
                        
                        {/* Alert count badge */}
                        {node.alertCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {node.alertCount}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Center hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Node Details */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">
              {selectedNode ? "Node Details" : "Threat Overview"}
            </h3>
            
            {selectedNode ? (
              <div className="space-y-3">
                {(() => {
                  const node = nodes.find((n: any) => n.id === selectedNode);
                  if (!node) return null;
                  
                  return (
                    <>
                      <div className="bg-dark-800 rounded-lg p-3">
                        <h4 className="text-white font-medium">{node.name}</h4>
                        <p className="text-dark-300 text-sm mt-1">
                          Type: {node.type} • {node.alertCount} alerts
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-dark-400">Risk Level:</span>
                          <span className={node.severityLevel >= 4 ? "text-red-400" : node.severityLevel >= 3 ? "text-yellow-400" : "text-green-400"}>
                            {node.severityLevel >= 4 ? "High" : node.severityLevel >= 3 ? "Medium" : "Low"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-dark-400">Connections:</span>
                          <span className="text-white">{Math.floor(Math.random() * 5) + 1}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-dark-400">Last Activity:</span>
                          <span className="text-white">
                            {new Date(node.lastActivity).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-dark-800 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Total Nodes:</span>
                    <span className="text-white">{nodes.length}</span>
                  </div>
                </div>
                <div className="bg-dark-800 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-dark-400">High Risk:</span>
                    <span className="text-red-400">
                      {nodes.filter((n: any) => n.severityLevel >= 4).length}
                    </span>
                  </div>
                </div>
                <div className="bg-dark-800 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Active Threats:</span>
                    <span className="text-yellow-400">
                      {nodes.filter((n: any) => n.alertCount > 0).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              size="sm" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setSelectedNode(null)}
            >
              {selectedNode ? "Clear Selection" : "Refresh Graph"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}