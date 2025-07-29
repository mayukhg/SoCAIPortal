import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SoC-AI Portal
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
            A unified, AI-powered Security Operations Center that supports Tier 1–3 analysts by triaging alerts, 
            simplifying investigations, enabling proactive threat detection, and streamlining reporting — all from a single dashboard.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
          >
            Sign In to Continue
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-dark-900 border-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-400">
                <Zap className="w-5 h-5 mr-2" />
                AI-Powered Triage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark-300">
                Intelligent alert prioritization with automated risk scoring and MITRE ATT&CK mapping.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-900 border-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-400">
                <TrendingUp className="w-5 h-5 mr-2" />
                Real-time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark-300">
                Live dashboards showing MTTD, MTTR, false positives, and escalation rates.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-900 border-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-400">
                <Users className="w-5 h-5 mr-2" />
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark-300">
                Seamless workflow handoffs, comments, tagging, and task assignments across tiers.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-900 border-dark-800">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-400">
                <Shield className="w-5 h-5 mr-2" />
                Threat Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark-300">
                Integrated threat correlation and investigation tools with AI-powered insights.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-dark-50">
            Ready to transform your Security Operations?
          </h2>
          <p className="text-dark-300 mb-8">
            Join thousands of security professionals already using SoC-AI Portal to enhance their threat detection and response capabilities.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            variant="outline"
            className="border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
