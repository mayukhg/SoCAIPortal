import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  LayoutDashboard, 
  AlertTriangle, 
  Search, 
  Share2, 
  TrendingUp, 
  FileText, 
  Users, 
  Settings 
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, current: true },
    { name: "Alerts", icon: AlertTriangle, count: 23 },
    { name: "Investigations", icon: Search },
    { name: "Threat Graph", icon: Share2 },
    { name: "Analytics", icon: TrendingUp },
    { name: "Reports", icon: FileText },
    { name: "Team", icon: Users },
  ];

  return (
    <div className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
      {/* Logo & Title */}
      <div className="p-4 border-b border-dark-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white text-sm" />
          </div>
          <h1 className="text-lg font-semibold text-dark-50">SoC-AI Portal</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href="#"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                item.current
                  ? "bg-indigo-600 text-white"
                  : "text-dark-300 hover:bg-dark-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
              {item.count && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
            alt="User profile" 
            className="w-8 h-8 rounded-full object-cover" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "User"}
            </p>
            <p className="text-xs text-dark-400 capitalize">
              {user?.role ? `Tier ${user.role.slice(-1)} Analyst` : "Analyst"}
            </p>
          </div>
          <button 
            onClick={() => window.location.href = "/api/logout"}
            className="text-dark-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
