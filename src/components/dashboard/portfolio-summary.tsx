import { formatUnits } from "viem";
import type { GetBalanceReturnType } from "wagmi/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTokenAmount, formatUsd } from "@/lib/format";
import type { PortfolioBreakdown } from "@/lib/types/dashboard";

interface PortfolioSummaryProps {
  totalValueUsd: number;
  breakdown: PortfolioBreakdown;
  nativeBalance?: GetBalanceReturnType;
  zilPriceUsd: number;
  portfolioChange: number;
  portfolioChangePercent: number;
}

export function PortfolioSummary({
  totalValueUsd,
  breakdown,
  nativeBalance,
  zilPriceUsd,
  portfolioChange,
  portfolioChangePercent,
}: PortfolioSummaryProps) {
  const nativeBalanceFormatted = nativeBalance
    ? formatTokenAmount(nativeBalance.value, nativeBalance.decimals, 2)
    : "0";

  const categories = [
    { label: "Native ZIL", value: breakdown.native },
    { label: "Tokens", value: breakdown.tokens },
    { label: "Liquid Staking", value: breakdown.liquidStaking },
    { label: "Non-Liquid Staking", value: breakdown.nonLiquidStaking },
    { label: "Liquidity", value: breakdown.liquidity },
  ].filter((c) => c.value > 0.01);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Value */}
        <div>
          <p className="text-muted-foreground text-sm">Total Value</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold">{formatUsd(totalValueUsd)}</p>
            {portfolioChange !== 0 && (
              <div
                className={`text-sm font-medium ${
                  portfolioChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>
                  {portfolioChange >= 0 ? "+" : ""}
                  {formatUsd(portfolioChange)}
                </span>
                <span className="ml-1">
                  ({portfolioChangePercent >= 0 ? "+" : ""}
                  {portfolioChangePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Native ZIL Balance */}
        {nativeBalance && nativeBalance.value > 0n && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <span className="font-semibold text-primary">ZIL</span>
              </div>
              <div>
                <p className="font-medium">Native ZIL</p>
                <p className="text-sm text-muted-foreground">
                  {nativeBalanceFormatted} ZIL
                </p>
              </div>
            </div>
            <p className="font-semibold">{formatUsd(breakdown.native)}</p>
          </div>
        )}

        {/* Breakdown */}
        {categories.length > 1 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Breakdown
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.label}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {category.label}
                  </span>
                  <span className="font-medium">
                    {formatUsd(category.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
