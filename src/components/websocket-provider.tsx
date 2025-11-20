"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Centrifuge, type Subscription } from "centrifuge/build/protobuf";

interface WebSocketContextType {
  centrifuge: Centrifuge | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  centrifuge: null,
  isConnected: false,
});

const WS_INFO_URL = "https://api-v2.zilstream.com/ws/info";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [centrifuge, setCentrifuge] = useState<Centrifuge | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        // 1. Get Info
        const infoRes = await fetch(WS_INFO_URL);
        if (!infoRes.ok) throw new Error("Failed to get WS info");
        const response = await infoRes.json();

        // Extract URL from response structure: { data: { url: "...", ... } }
        const url = response.data?.url;

        if (!url) throw new Error("No WebSocket URL in response");

        // 2. Get Token (Required for connection)
        const tokenRes = await fetch("https://api-v2.zilstream.com/ws/token", {
          method: "POST",
        });
        if (!tokenRes.ok) throw new Error("Failed to get WS token");
        const tokenData = await tokenRes.json();
        const token = tokenData.data?.token;

        if (!token) throw new Error("No WebSocket token in response");

        if (!mounted) return;

        // 3. Initialize Centrifuge
        // Note: Using protobuf import requires the server to support it.
        // Most Centrifugo v2+ servers support protobuf.
        const c = new Centrifuge(url, {
          token: token,
          debug: true, // Keep debug enabled for now to see logs
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
  }, []);

  return (
    <WebSocketContext.Provider value={{ centrifuge, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
