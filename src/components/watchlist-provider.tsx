import { createContext, useContext, useMemo } from "react";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { WatchlistKind } from "@/lib/watchlist";

interface WatchlistContextValue {
  tokens: string[];
  pairs: string[];
  isLoaded: boolean;
  toggle: (kind: WatchlistKind, address: string) => void;
  isWatched: (kind: WatchlistKind, address: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function useWatchlistContext() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error(
      "useWatchlistContext must be used within a WatchlistProvider",
    );
  }
  return context;
}

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { tokens, pairs, isLoaded, toggle, isWatched } = useWatchlist();

  const value = useMemo<WatchlistContextValue>(
    () => ({ tokens, pairs, isLoaded, toggle, isWatched }),
    [tokens, pairs, isLoaded, toggle, isWatched],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}
