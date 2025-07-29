import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/schema";

export default function AIChatPanel() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const summarizeAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/summarize-alerts", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to summarize alerts");
      return response.json();
    },
    onSuccess: (data) => {
      sendMessageMutation.mutate(`Please summarize current alerts: ${data.summary}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to summarize alerts",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-80 bg-dark-900 border-l border-dark-800 flex flex-col">
      <CardHeader className="border-b border-dark-800">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <Bot className="w-5 h-5 mr-2 text-indigo-400" />
          AI Assistant
        </CardTitle>
        <p className="text-sm text-dark-400">
          Ask questions about alerts and investigations
        </p>
      </CardHeader>

      {/* Chat Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-dark-400 py-8">
            <Bot className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
            <p>Start a conversation with the AI assistant</p>
          </div>
        )}
        
        {messages.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.isFromAI ? "" : "justify-end"
            }`}
          >
            {msg.isFromAI ? (
              <>
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 bg-dark-800 rounded-lg p-3">
                  <p className="text-sm text-white">{msg.message}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 bg-indigo-600 rounded-lg p-3">
                  <p className="text-sm text-white">{msg.message}</p>
                </div>
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
              </>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 bg-dark-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse animation-delay-200"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse animation-delay-400"></div>
                <span className="text-xs text-dark-400 ml-2">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Chat Input */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex space-x-2 mb-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI about alerts or threats..."
            className="flex-1 bg-dark-800 border-dark-700 text-white placeholder-dark-400 focus:border-indigo-500"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => summarizeAlertsMutation.mutate()}
            disabled={summarizeAlertsMutation.isPending}
            size="sm"
            variant="outline"
            className="text-xs bg-dark-800 text-dark-300 border-dark-700 hover:bg-dark-700"
          >
            Summarize alerts
          </Button>
          <Button
            onClick={() => setMessage("Check threat intelligence for recent indicators")}
            size="sm"
            variant="outline"
            className="text-xs bg-dark-800 text-dark-300 border-dark-700 hover:bg-dark-700"
          >
            Check threat intel
          </Button>
        </div>
      </div>
    </div>
  );
}
