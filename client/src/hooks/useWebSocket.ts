import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";

export function useWebSocket() {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const ws = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      setReadyState(WebSocket.OPEN);
      // Send authentication
      ws.current?.send(JSON.stringify({ type: "auth", userId: user.id }));
    };

    ws.current.onmessage = (event) => {
      setLastMessage(event);
    };

    ws.current.onclose = () => {
      setReadyState(WebSocket.CLOSED);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setReadyState(WebSocket.CLOSED);
    };

    return () => {
      ws.current?.close();
    };
  }, [user]);

  return {
    lastMessage,
    readyState,
  };
}
