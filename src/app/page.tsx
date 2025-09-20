import { ArrowRight, BarChart3, Crown, Rocket } from "lucide-react";
import Link from "next/link";

import { PairsTable } from "@/components/pairs-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber, formatUsd } from "@/lib/format";
import { fetchPairs, fetchTokens } from "@/lib/zilstream";

export default async function HomePage() {
  const [{ data: pairs, pagination }, tokensResponse] = await Promise.all([
    fetchPairs(),
    fetchTokens(),
  ]);

  const totalLiquidity = pairs.reduce(
    (acc, pair) => acc + (Number.parseFloat(pair.liquidityUsd ?? "0") || 0),
    0,
  );
  const totalVolume = pairs.reduce(
    (acc, pair) => acc + (Number.parseFloat(pair.volumeUsd ?? "0") || 0),
    0,
  );
  const totalPairs = pairs.length;
  const totalTokens = tokensResponse.data.length;

  const topPairs = [...pairs]
    .sort(
      (a, b) =>
        (Number.parseFloat(b.volumeUsd ?? "0") || 0) -
        (Number.parseFloat(a.volumeUsd ?? "0") || 0),
    )
    .slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 p-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),transparent_60%)]" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge variant="secondary" className="bg-white/70 text-primary">
              ZilStream V2 • EVM + Zilliqa 2.0
            </Badge>
            <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              Discover on-chain liquidity powering the next chapter of Zilliqa.
            </h1>
            <p className="text-muted-foreground text-lg">
              Follow the most active pools, track cross-chain tokens, and stay
              ahead as ZilStream pivots toward an EVM-first future on Zilliqa
              2.0.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                href="/pairs"
              >
                Explore markets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                href="/tokens"
              >
                View tokens
              </Link>
            </div>
          </div>
          <Card className="w-full max-w-sm bg-background/85 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-primary" />
                Liquidity pulse
              </CardTitle>
              <CardDescription>
                Snapshot of the current EVM market on Zilliqa 2.0.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <StatRow
                label="Total Liquidity"
                value={formatUsd(totalLiquidity)}
              />
              <StatRow label="24h Volume" value={formatUsd(totalVolume)} />
              <StatRow
                label="Listed Pairs"
                value={formatNumber(totalPairs, 0)}
              />
              <StatRow
                label="Tracked Tokens"
                value={formatNumber(totalTokens, 0)}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-5 w-5 text-primary" />
              Built for Zilliqa 2.0
            </CardTitle>
            <CardDescription>
              ZilStream V2 aligns with the network's renewed focus on EVM
              liquidity and cross-chain participation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Monitor how capital migrates into the upgraded chain, with fresh
              pools and rebuilt infrastructure designed for rapid iteration.
            </p>
            <p>
              Tokens, pools, and events all sync continuously, keeping this view
              representative of the latest market structure.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-5 w-5 text-primary" />
              Leaders right now
            </CardTitle>
            <CardDescription>
              The busiest pairs by recent volume across the EVM frontier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPairs.map((pair) => (
              <div
                key={pair.address}
                className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {pair.token0Symbol} / {pair.token1Symbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {pair.protocol}
                  </span>
                </div>
                <div className="text-right text-sm font-semibold">
                  {formatUsd(pair.volumeUsd)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <PairsTable
        pairs={pairs}
        pagination={pagination}
        title="Live Pairs"
        description={`Page ${pagination.page} • Showing up to ${pagination.perPage} pairs`}
      />
    </main>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
