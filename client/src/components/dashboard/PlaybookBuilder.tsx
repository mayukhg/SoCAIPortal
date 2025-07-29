import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Play, Save, Copy, Trash2, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  type: "manual" | "automated" | "decision";
  estimatedTime: number;
  required: boolean;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  steps: PlaybookStep[];
  lastModified: Date;
  version: string;
}

export default function PlaybookBuilder() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const samplePlaybooks: Playbook[] = [
    {
      id: "1",
      name: "Malware Incident Response",
      description: "Standard response for malware detection and containment",
      category: "Incident Response",
      severity: "high",
      version: "2.1",
      lastModified: new Date(),
      steps: [
        {
          id: "1",
          title: "Initial Assessment",
          description: "Verify malware detection and assess scope",
          type: "manual",
          estimatedTime: 15,
          required: true
        },
        {
          id: "2", 
          title: "Isolate Affected Systems",
          description: "Disconnect infected systems from network",
          type: "automated",
          estimatedTime: 5,
          required: true
        },
        {
          id: "3",
          title: "Collect Evidence",
          description: "Gather system logs and forensic artifacts",
          type: "manual",
          estimatedTime: 30,
          required: true
        },
        {
          id: "4",
          title: "Escalation Decision",
          description: "Determine if incident requires escalation",
          type: "decision",
          estimatedTime: 10,
          required: false
        }
      ]
    },
    {
      id: "2",
      name: "Phishing Email Investigation",
      description: "Process for analyzing and responding to phishing attempts",
      category: "Email Security",
      severity: "medium",
      version: "1.3",
      lastModified: new Date(),
      steps: [
        {
          id: "1",
          title: "Email Analysis",
          description: "Examine email headers, attachments, and links",
          type: "manual",
          estimatedTime: 20,
          required: true
        },
        {
          id: "2",
          title: "Block Malicious URLs",
          description: "Add URLs to blocklist if confirmed malicious",
          type: "automated",
          estimatedTime: 2,
          required: true
        },
        {
          id: "3",
          title: "User Notification",
          description: "Notify affected users and provide guidance",
          type: "manual",
          estimatedTime: 15,
          required: true
        }
      ]
    },
    {
      id: "3",
      name: "DDoS Mitigation",
      description: "Response procedures for DDoS attacks",
      category: "Network Security", 
      severity: "critical",
      version: "1.0",
      lastModified: new Date(),
      steps: [
        {
          id: "1",
          title: "Traffic Analysis",
          description: "Analyze attack vectors and traffic patterns",
          type: "manual",
          estimatedTime: 10,
          required: true
        },
        {
          id: "2",
          title: "Enable DDoS Protection",
          description: "Activate cloud-based DDoS mitigation",
          type: "automated",
          estimatedTime: 3,
          required: true
        },
        {
          id: "3",
          title: "Monitor Recovery",
          description: "Track service restoration and performance",
          type: "manual",
          estimatedTime: 60,
          required: true
        }
      ]
    }
  ];

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case "automated": return "bg-green-900 text-green-300";
      case "decision": return "bg-yellow-900 text-yellow-300";
      default: return "bg-blue-900 text-blue-300";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400";
      case "high": return "text-orange-400";
      case "medium": return "text-yellow-400";
      default: return "text-green-400";
    }
  };

  const runPlaybook = (playbookId: string) => {
    setSelectedPlaybook(playbookId);
    setIsRunning(true);
    setCurrentStep(0);
    toast({
      title: "Playbook Started",
      description: "Following incident response procedures",
    });
  };

  const nextStep = () => {
    const playbook = samplePlaybooks.find(p => p.id === selectedPlaybook);
    if (playbook && currentStep < playbook.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsRunning(false);
      toast({
        title: "Playbook Completed",
        description: "All steps have been executed successfully",
      });
    }
  };

  const totalEstimatedTime = (playbook: Playbook) => {
    return playbook.steps.reduce((total, step) => total + step.estimatedTime, 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Playbook Library */}
      <Card className="lg:col-span-2 bg-dark-900 border-dark-800">
        <CardHeader className="border-b border-dark-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-400" />
              Incident Response Playbooks
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Playbook
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {samplePlaybooks.map((playbook) => (
              <div
                key={playbook.id}
                className={`bg-dark-800 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlaybook === playbook.id ? "ring-2 ring-indigo-500" : "hover:bg-dark-700"
                }`}
                onClick={() => setSelectedPlaybook(selectedPlaybook === playbook.id ? null : playbook.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-white font-medium">{playbook.name}</h4>
                      <Badge className={getSeverityColor(playbook.severity)} variant="outline">
                        {playbook.severity}
                      </Badge>
                      <Badge variant="secondary" className="bg-dark-700 text-dark-300">
                        v{playbook.version}
                      </Badge>
                    </div>
                    <p className="text-dark-400 text-sm mt-1">{playbook.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-dark-400">
                      <span>{playbook.category}</span>
                      <span>{playbook.steps.length} steps</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        ~{totalEstimatedTime(playbook)}m
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        runPlaybook(playbook.id);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-dark-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {selectedPlaybook === playbook.id && (
                  <div className="mt-4 pt-4 border-t border-dark-700">
                    <h5 className="text-white font-medium mb-3">Steps:</h5>
                    <div className="space-y-2">
                      {playbook.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between bg-dark-700 rounded p-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-dark-400 text-sm w-6">
                              {index + 1}.
                            </span>
                            <span className="text-white text-sm">{step.title}</span>
                            <Badge className={getStepTypeColor(step.type)} variant="secondary">
                              {step.type}
                            </Badge>
                            {step.required && (
                              <Badge variant="destructive" className="bg-red-900 text-red-300">
                                Required
                              </Badge>
                            )}
                          </div>
                          <span className="text-dark-400 text-xs">
                            {step.estimatedTime}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Playbook Execution */}
      <Card className="bg-dark-900 border-dark-800">
        <CardHeader className="border-b border-dark-800">
          <CardTitle className="text-lg font-semibold text-white">
            {isRunning ? "Executing Playbook" : "Playbook Actions"}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {isRunning && selectedPlaybook ? (
            <div className="space-y-4">
              {(() => {
                const playbook = samplePlaybooks.find(p => p.id === selectedPlaybook);
                if (!playbook) return null;
                
                const step = playbook.steps[currentStep];
                return (
                  <>
                    <div className="bg-dark-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          Step {currentStep + 1} of {playbook.steps.length}
                        </span>
                        <Badge className={getStepTypeColor(step.type)} variant="secondary">
                          {step.type}
                        </Badge>
                      </div>
                      <h4 className="text-white font-medium">{step.title}</h4>
                      <p className="text-dark-400 text-sm mt-1">
                        {step.description}
                      </p>
                      <div className="flex items-center mt-3 text-xs text-dark-400">
                        <Clock className="w-3 h-3 mr-1" />
                        Estimated time: {step.estimatedTime} minutes
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Progress:</span>
                        <span className="text-white">
                          {Math.round(((currentStep + 1) / playbook.steps.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-dark-800 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentStep + 1) / playbook.steps.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={nextStep}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {currentStep === playbook.steps.length - 1 ? "Complete" : "Next Step"}
                      </Button>
                      <Button
                        onClick={() => setIsRunning(false)}
                        variant="outline"
                        className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        Stop Execution
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-dark-400 mx-auto mb-2" />
                <p className="text-dark-400">
                  {selectedPlaybook ? "Select an action" : "Select a playbook to begin"}
                </p>
              </div>

              {selectedPlaybook && (
                <div className="space-y-2">
                  <Button
                    onClick={() => runPlaybook(selectedPlaybook)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Execute Playbook
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-dark-600 text-dark-300 hover:bg-dark-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Edit Playbook
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-dark-600 text-dark-300 hover:bg-dark-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-dark-800">
                <h4 className="text-white font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Response
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-dark-600 text-dark-300 hover:bg-dark-700"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Templates
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}