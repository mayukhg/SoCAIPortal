import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock, Wrench, CheckCircle } from "lucide-react";

interface DashboardMetrics {
  activeAlerts: number;
  criticalAlerts: number;
  avgMTTD: number;
  avgMTTR: number;
  falsePositiveRate: number;
}

export default function KPICards() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-dark-900 border-dark-800 p-4 animate-pulse">
            <div className="h-16 bg-dark-800 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const kpiData = [
    {
      title: "Active Alerts",
      value: metrics?.activeAlerts || 0,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500 bg-opacity-20",
      change: "+12%",
      changeColor: "text-red-400",
      subtitle: "vs last hour",
    },
    {
      title: "MTTD",
      value: `${metrics?.avgMTTD || 4.2}m`,
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-500 bg-opacity-20",
      change: "-8%",
      changeColor: "text-green-400",
      subtitle: "improvement",
    },
    {
      title: "MTTR", 
      value: `${metrics?.avgMTTR || 18.5}m`,
      icon: Wrench,
      color: "text-purple-400",
      bgColor: "bg-purple-500 bg-opacity-20",
      change: "-15%",
      changeColor: "text-green-400",
      subtitle: "improvement",
    },
    {
      title: "False Positives",
      value: `${metrics?.falsePositiveRate || 3.2}%`,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500 bg-opacity-20",
      change: "-22%",
      changeColor: "text-green-400",
      subtitle: "reduction",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="bg-dark-900 border-dark-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">{kpi.title}</p>
                <p className="text-2xl font-semibold text-white">{kpi.value}</p>
              </div>
              <div className={`p-3 ${kpi.bgColor} rounded-lg`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className={kpi.changeColor}>{kpi.change}</span>
              <span className="text-dark-400 ml-1">{kpi.subtitle}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
