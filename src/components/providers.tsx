import { PriceAlertsProvider } from "./price-alerts-provider";
import { WatchlistProvider } from "./watchlist-provider";
import { WebSocketProvider } from "./websocket-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PriceAlertsProvider>
      <WatchlistProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </WatchlistProvider>
    </PriceAlertsProvider>
  );
}
