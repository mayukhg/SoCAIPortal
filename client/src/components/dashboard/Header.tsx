import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, RotateCcw } from "lucide-react";

export default function Header() {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  };

  return (
    <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-white">SOC Dashboard</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
          Live Monitoring
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative text-dark-400 hover:text-white hover:bg-dark-800"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            3
          </span>
        </Button>
        
        <div className="text-sm text-dark-400">
          Last updated: <span className="text-white">{getTimeAgo()}</span>
        </div>
      </div>
    </header>
  );
}
