import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { PriceAlertsProvider } from "./price-alerts-provider";
import { WatchlistProvider } from "./watchlist-provider";
import { WebSocketProvider } from "./websocket-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <PriceAlertsProvider>
        <WatchlistProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </WatchlistProvider>
      </PriceAlertsProvider>
    </WagmiProvider>
  );
}
