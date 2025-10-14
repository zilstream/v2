"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { formatUsd } from "@/lib/format";

export function HeaderStats() {
  const [stats, setStats] = useState({ liquidity: 0, volume: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          liquidity: Number.parseFloat(data.totalLiquidityUsd),
          volume: Number.parseFloat(data.totalVolumeUsd24h),
        });
      })
      .catch((error) => {
        console.error("Failed to fetch stats:", error);
      });
  }, []);

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Liquidity:</span>
        <span className="font-semibold">{formatUsd(stats.liquidity)}</span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">24h Vol:</span>
        <span className="font-semibold">{formatUsd(stats.volume)}</span>
      </div>
    </div>
  );
}
