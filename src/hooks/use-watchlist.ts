"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isInWatchlist,
  loadWatchlist,
  saveWatchlist,
  toggleWatchlistEntry,
  type WatchlistKind,
  type WatchlistState,
} from "@/lib/watchlist";

export function useWatchlist() {
  const [state, setState] = useState<WatchlistState>({
    tokens: [],
    pairs: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setState(loadWatchlist());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveWatchlist(state);
    }
  }, [state, isLoaded]);

  const toggle = useCallback((kind: WatchlistKind, address: string) => {
    setState((prev) => toggleWatchlistEntry(prev, kind, address));
  }, []);

  const isWatched = useCallback(
    (kind: WatchlistKind, address: string) =>
      isInWatchlist(state, kind, address),
    [state],
  );

  return {
    tokens: state.tokens,
    pairs: state.pairs,
    isLoaded,
    toggle,
    isWatched,
  };
}
