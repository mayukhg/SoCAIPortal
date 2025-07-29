import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar, Filter, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function ReportsPanel() {
  const [reportType, setReportType] = useState("executive");
  const [timeRange, setTimeRange] = useState("7d");
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (params: { type: string; timeRange: string }) => {
      setIsGenerating(true);
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      return {
        reportId: `report_${Date.now()}`,
        filename: `${params.type}_report_${params.timeRange}.pdf`,
        downloadUrl: "#"
      };
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      toast({
        title: "Report Generated",
        description: `${data.filename} is ready for download`,
      });
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  const reportTypes = [
    {
      id: "executive",
      name: "Executive Summary",
      description: "High-level security posture overview for leadership",
      icon: TrendingUp,
      requiredRole: ["tier3", "manager"]
    },
    {
      id: "technical",
      name: "Technical Analysis",
      description: "Detailed threat analysis and IOCs for analysts",
      icon: Shield,
      requiredRole: ["tier2", "tier3", "manager"]
    },
    {
      id: "compliance",
      name: "Compliance Report",
      description: "SOC2, ISO, and regulatory compliance metrics",
      icon: FileText,
      requiredRole: ["manager"]
    },
    {
      id: "incident",
      name: "Incident Response",
      description: "Detailed incident timeline and response actions",
      icon: Calendar,
      requiredRole: ["tier2", "tier3", "manager"]
    }
  ];

  const canAccessReport = (requiredRoles: string[]) => {
    return user?.role && requiredRoles.includes(user.role);
  };

  const recentReports = [
    {
      id: "1",
      name: "Weekly Security Summary",
      type: "Executive Summary",
      generated: "2024-01-15T10:30:00Z",
      size: "2.3 MB"
    },
    {
      id: "2", 
      name: "APT Campaign Analysis",
      type: "Technical Analysis",
      generated: "2024-01-14T15:45:00Z",
      size: "8.7 MB"
    },
    {
      id: "3",
      name: "Q4 Compliance Report",
      type: "Compliance Report", 
      generated: "2024-01-10T09:15:00Z",
      size: "1.8 MB"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Report Generator */}
      <Card className="bg-dark-900 border-dark-800">
        <CardHeader className="border-b border-dark-800">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-400" />
            Generate Report
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-dark-800 text-white border-dark-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-800 border-dark-700">
                {reportTypes.map((type) => (
                  <SelectItem 
                    key={type.id} 
                    value={type.id}
                    disabled={!canAccessReport(type.requiredRole)}
                  >
                    <div className="flex items-center space-x-2">
                      <type.icon className="w-4 h-4" />
                      <span>{type.name}</span>
                      {!canAccessReport(type.requiredRole) && (
                        <span className="text-red-400 text-xs">(Restricted)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reportTypes.find(t => t.id === reportType) && (
              <p className="text-dark-400 text-sm">
                {reportTypes.find(t => t.id === reportType)?.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="bg-dark-800 text-white border-dark-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-800 border-dark-700">
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Report Title</Label>
            <Input
              placeholder="Custom report title (optional)"
              className="bg-dark-800 border-dark-700 text-white"
            />
          </div>

          <div className="bg-dark-800 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-medium">Report Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-dark-400">Active Alerts:</span>
                <span className="text-white ml-2">{metrics?.activeAlerts || 0}</span>
              </div>
              <div>
                <span className="text-dark-400">Critical Alerts:</span>
                <span className="text-red-400 ml-2">{metrics?.criticalAlerts || 0}</span>
              </div>
              <div>
                <span className="text-dark-400">MTTD:</span>
                <span className="text-white ml-2">{metrics?.avgMTTD || 4.2}m</span>
              </div>
              <div>
                <span className="text-dark-400">MTTR:</span>
                <span className="text-white ml-2">{metrics?.avgMTTR || 18.5}m</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => generateReportMutation.mutate({ type: reportType, timeRange })}
            disabled={isGenerating || !canAccessReport(reportTypes.find(t => t.id === reportType)?.requiredRole || [])}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="bg-dark-900 border-dark-800">
        <CardHeader className="border-b border-dark-800">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Download className="w-5 h-5 mr-2 text-indigo-400" />
            Recent Reports
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="bg-dark-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{report.name}</h4>
                    <p className="text-dark-400 text-sm">{report.type}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-dark-400">
                      <span>{new Date(report.generated).toLocaleDateString()}</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-indigo-400 hover:text-white hover:bg-dark-700"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-dark-800">
            <Button variant="outline" className="w-full border-dark-700 text-dark-300 hover:bg-dark-800">
              <Filter className="w-4 h-4 mr-2" />
              View All Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}