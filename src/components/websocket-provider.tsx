import type { Centrifuge } from "centrifuge/build/protobuf";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface WebSocketContextType {
  centrifuge: Centrifuge | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  centrifuge: null,
  isConnected: false,
});

const WS_INFO_URL = "https://api-v2.zilstream.com/ws/info";
const WS_TOKEN_URL = "https://api-v2.zilstream.com/ws/token";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [centrifuge, setCentrifuge] = useState<Centrifuge | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      try {
        const [infoRes, tokenRes] = await Promise.all([
          fetch(WS_INFO_URL),
          fetch(WS_TOKEN_URL, { method: "POST" }),
        ]);
        if (!infoRes.ok) throw new Error("Failed to get WS info");
        if (!tokenRes.ok) throw new Error("Failed to get WS token");

        const [infoJson, tokenJson] = await Promise.all([
          infoRes.json(),
          tokenRes.json(),
        ]);
        const url = infoJson.data?.url;
        const token = tokenJson.data?.token;

        if (!url) throw new Error("No WebSocket URL in response");
        if (!token) throw new Error("No WebSocket token in response");

        if (cancelled) return;

        const { Centrifuge } = await import("centrifuge/build/protobuf");
        if (cancelled) return;

        const c = new Centrifuge(url, { token, debug: true });

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

    const ric = (
      globalThis as {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    ).requestIdleCallback;

    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    if (ric) {
      idleHandle = ric(
        () => {
          connect();
        },
        { timeout: 3000 },
      );
    } else {
      timeoutHandle = setTimeout(connect, 0);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) {
        (
          globalThis as {
            cancelIdleCallback?: (handle: number) => void;
          }
        ).cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
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
