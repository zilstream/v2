import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useMemo } from "react";

import { PairsTable } from "@/components/pairs-table";
import { TokensTable } from "@/components/tokens-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWatchlistContext } from "@/components/watchlist-provider";
import { fetchPairByAddress, fetchTokenByAddress } from "@/lib/api-client";
import type { Pair, Token } from "@/lib/zilstream";

export function WatchlistView() {
  const {
    tokens: tokenAddresses,
    pairs: pairAddresses,
    isLoaded,
  } = useWatchlistContext();

  const tokenQueries = useQueries({
    queries: tokenAddresses.map((address) => ({
      queryKey: ["token", address],
      queryFn: () => fetchTokenByAddress(address),
      enabled: isLoaded,
      staleTime: 30_000,
    })),
  });

  const pairQueries = useQueries({
    queries: pairAddresses.map((address) => ({
      queryKey: ["pair", address],
      queryFn: () => fetchPairByAddress(address),
      enabled: isLoaded,
      staleTime: 30_000,
    })),
  });

  const tokens = useMemo<Token[]>(
    () =>
      tokenQueries
        .map((q) => q.data)
        .filter((token): token is Token => Boolean(token)),
    [tokenQueries],
  );

  const pairs = useMemo<Pair[]>(
    () =>
      pairQueries
        .map((q) => q.data)
        .filter((pair): pair is Pair => Boolean(pair)),
    [pairQueries],
  );

  const isTokensLoading =
    tokenAddresses.length > 0 &&
    tokens.length === 0 &&
    tokenQueries.some((q) => q.isLoading);

  const isPairsLoading =
    pairAddresses.length > 0 &&
    pairs.length === 0 &&
    pairQueries.some((q) => q.isLoading);

  if (isLoaded && tokenAddresses.length === 0 && pairAddresses.length === 0) {
    return <WatchlistEmpty />;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {(tokenAddresses.length > 0 || isTokensLoading) && (
        <TokensTable
          tokens={tokens}
          title="Watched Tokens"
          emptyMessage={
            isTokensLoading ? "Loading watched tokens..." : "No tokens yet."
          }
        />
      )}
      {(pairAddresses.length > 0 || isPairsLoading) && (
        <PairsTable pairs={pairs} title="Watched Pairs" />
      )}
    </div>
  );
}

function WatchlistEmpty() {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Star className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>Your watchlist is empty</CardTitle>
        <CardDescription>
          Tap the star next to any token or pair to add it here. Your watchlist
          is saved on this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 pb-6 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link to="/tokens">Browse Tokens</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/pairs">Browse Pairs</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
