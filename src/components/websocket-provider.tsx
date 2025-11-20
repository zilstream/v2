"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Centrifuge, type Subscription } from "centrifuge";

interface WebSocketContextType {
  centrifuge: Centrifuge | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  centrifuge: null,
  isConnected: false,
});

const WS_BASE_URL = "https://ws.zilstream.com";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [centrifuge, setCentrifuge] = useState<Centrifuge | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  const getToken = useCallback(async () => {
    try {
      const res = await fetch(`${WS_BASE_URL}/ws/token`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to get token");
      const data = await res.json();
      return data.token;
    } catch (error) {
      console.error("Error getting websocket token:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        // 1. Get Info
        const infoRes = await fetch(`${WS_BASE_URL}/ws/info`);
        if (!infoRes.ok) throw new Error("Failed to get WS info");
        const info = await infoRes.json();

        if (!mounted) return;

        // 2. Get Token
        const token = await getToken();

        if (!mounted) return;

        // 3. Initialize Centrifuge
        const c = new Centrifuge(info.url, {
          token,
          getToken: getToken, // Automatic token refresh
        });

        c.on("connected", (ctx) => {
          console.log("WebSocket connected", ctx);
          setIsConnected(true);
        });

        c.on("disconnected", (ctx) => {
          console.log("WebSocket disconnected", ctx);
          setIsConnected(false);
        });

        c.on("error", (ctx) => {
          console.error("WebSocket error", ctx);
        });

        c.connect();
        centrifugeRef.current = c;
        setCentrifuge(c);
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
      }
    };

    connect();

    return () => {
      mounted = false;
      if (centrifugeRef.current) {
        centrifugeRef.current.disconnect();
        centrifugeRef.current = null;
      }
    };
  }, [getToken]);

  return (
    <WebSocketContext.Provider value={{ centrifuge, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
