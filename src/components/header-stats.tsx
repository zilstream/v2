"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { formatPriceUsd, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

async function fetchStats() {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export function HeaderStats() {
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const liquidity = data ? Number.parseFloat(data.totalLiquidityUsd) : 0;
  const volume = data ? Number.parseFloat(data.totalVolumeUsd24h) : 0;
  const zilPrice = data ? Number.parseFloat(data.zilPriceUsd) : 0;
  const zilChange = data ? Number.parseFloat(data.zilPriceChange24h) : 0;

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">ZIL:</span>
        <span className="font-semibold">{formatPriceUsd(zilPrice)}</span>
        <span
          className={cn(
            "font-medium",
            zilChange >= 0 ? "text-green-500" : "text-red-500",
          )}
        >
          ({zilChange > 0 ? "+" : ""}
          {zilChange.toFixed(2)}%)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Liquidity:</span>
        <span className="font-semibold">{formatUsd(liquidity)}</span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">24h Vol:</span>
        <span className="font-semibold">{formatUsd(volume)}</span>
      </div>
    </div>
  );
}
