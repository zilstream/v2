"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { PriceAlertsProvider } from "./price-alerts-provider";
import { WatchlistProvider } from "./watchlist-provider";
import { WebSocketProvider } from "./websocket-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PriceAlertsProvider>
          <WatchlistProvider>
            <WebSocketProvider>{children}</WebSocketProvider>
          </WatchlistProvider>
        </PriceAlertsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
