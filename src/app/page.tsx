import { ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

import { LivePairsSection } from "@/components/live-pairs-section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber, formatUsd } from "@/lib/format";
import { fetchPairs, fetchStats } from "@/lib/zilstream";

export default async function HomePage() {
  const [{ data: pairs, pagination }, stats] = await Promise.all([
    fetchPairs(1, 50),
    fetchStats(),
  ]);

  const totalLiquidity = Number.parseFloat(stats.totalLiquidityUsd);
  const totalVolume = Number.parseFloat(stats.totalVolumeUsd24h);
  const totalPairs = stats.totalPairs;
  const totalTokens = stats.totalTokens;

  return (
    <main className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 md:p-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),transparent_60%)]" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge
              variant="secondary"
              className="bg-white/70 text-primary dark:bg-primary/20 dark:text-white dark:border-primary/30"
            >
              ZilStream V2 • EVM + Zilliqa 2.0
            </Badge>
            <h1 className="text-balance text-2xl font-semibold leading-tight sm:text-3xl">
              Zilliqa EVM ecosystem market data
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome to newly updated ZilStream. Track pools, tokens,
              transactions and more in real-time powered by Zilliqa 2.0 EVM.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                href="/pairs"
              >
                Explore markets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
                href="/tokens"
              >
                View tokens
              </Link>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Looking for the old ZilStream? Visit the{" "}
              <Link
                href="https://legacy.zilstream.com"
                target="_blank"
                className="font-medium text-foreground underline decoration-border hover:text-primary hover:decoration-primary"
              >
                legacy site here
              </Link>{" "}
              (
              <Link
                href="/news/sunsetting-zilstream-legacy"
                className="font-medium text-foreground underline decoration-border hover:text-primary hover:decoration-primary"
              >
                sunsetting early next year
              </Link>
              ).
            </p>
          </div>
          <Card className="w-full max-w-sm bg-background/85 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-primary" />
                Liquidity pulse
              </CardTitle>
              <CardDescription className="text-xs">
                Snapshot of the current EVM market on Zilliqa 2.0.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
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

      <LivePairsSection initialPairs={pairs} initialPagination={pagination} />
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
