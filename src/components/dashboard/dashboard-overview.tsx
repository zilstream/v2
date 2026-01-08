"use client";

import type { Address } from "viem";
import { useBalance } from "wagmi";
import { formatEther } from "viem";

import { usePortfolioBalances } from "@/hooks/use-portfolio-balances";
import { useStakingPositions } from "@/hooks/use-staking-positions";
import { useLiquidityPositions } from "@/hooks/use-liquidity-positions";
import { useV3LiquidityPositions } from "@/hooks/use-v3-liquidity-positions";
import { useAddressEvents, useStats } from "@/hooks/use-zilstream-queries";

import { PortfolioSummary } from "./portfolio-summary";
import { TokenBalancesCard } from "./token-balances-card";
import { RecentTradesCard } from "./recent-trades-card";
import { LiquidityPositionsCard } from "./liquidity-positions-card";
import { StakingPositionsCard } from "./staking-positions-card";
import { DashboardSkeleton } from "./dashboard-skeleton";

interface DashboardOverviewProps {
  address: Address;
}

export function DashboardOverview({ address }: DashboardOverviewProps) {
  const { data: stats } = useStats();
  const { data: nativeBalance } = useBalance({ address });
  const { data: tokenBalances, isLoading: isLoadingTokens, error: tokensError } =
    usePortfolioBalances();
  const { data: stakingPositions, isLoading: isLoadingStaking, error: stakingError } =
    useStakingPositions();
  const { data: lpPositionsV2, isLoading: isLoadingLPV2, error: lpV2Error } = useLiquidityPositions();
  const { data: lpPositionsV3, isLoading: isLoadingLPV3, error: lpV3Error } = useV3LiquidityPositions();

  console.log("[DashboardOverview] State:", {
    address,
    isLoadingTokens,
    isLoadingStaking,
    isLoadingLPV2,
    isLoadingLPV3,
    tokensError: tokensError?.message,
    stakingError: stakingError?.message,
    lpV2Error: lpV2Error?.message,
    lpV3Error: lpV3Error?.message,
    tokenBalancesCount: tokenBalances?.length,
    stakingLiquidCount: stakingPositions?.liquid?.length,
    lpV2Count: lpPositionsV2?.length,
    lpV3Count: lpPositionsV3?.length,
  });
  const { data: recentEvents, isLoading: isLoadingEvents } = useAddressEvents(
    address,
    1,
    10
  );

  const zilPriceUsd = Number.parseFloat(stats?.zilPriceUsd || "0");

  // Calculate native ZIL value
  const nativeZilValue = nativeBalance
    ? Number(formatEther(nativeBalance.value)) * zilPriceUsd
    : 0;

  // Calculate total portfolio value
  const tokensValue =
    tokenBalances?.reduce((sum, t) => sum + t.valueUsd, 0) ?? 0;
  const liquidStakingValue =
    stakingPositions?.liquid.reduce((sum, p) => sum + p.valueUsd, 0) ?? 0;
  const nonLiquidStakingValue =
    stakingPositions?.nonLiquid.reduce((sum, p) => sum + p.valueUsd, 0) ?? 0;
  const lpV2Value = lpPositionsV2?.reduce((sum, p) => sum + p.valueUsd, 0) ?? 0;
  const lpV3Value = lpPositionsV3?.reduce((sum, p) => sum + p.valueUsd, 0) ?? 0;
  const lpValue = lpV2Value + lpV3Value;

  const totalValue =
    nativeZilValue +
    tokensValue +
    liquidStakingValue +
    nonLiquidStakingValue +
    lpValue;

  const isLoading = isLoadingTokens || isLoadingStaking || isLoadingLPV2 || isLoadingLPV3;

  // Show skeleton only on initial load
  if (isLoading && !tokenBalances && !stakingPositions && !lpPositionsV2 && !lpPositionsV3) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <PortfolioSummary
        totalValueUsd={totalValue}
        breakdown={{
          native: nativeZilValue,
          tokens: tokensValue,
          liquidStaking: liquidStakingValue,
          nonLiquidStaking: nonLiquidStakingValue,
          liquidity: lpValue,
        }}
        nativeBalance={nativeBalance}
        zilPriceUsd={zilPriceUsd}
      />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TokenBalancesCard
          tokens={tokenBalances ?? []}
          isLoading={isLoadingTokens}
        />
        <RecentTradesCard
          events={recentEvents?.data ?? []}
          isLoading={isLoadingEvents}
        />
      </div>

      {/* Staking Positions */}
      <StakingPositionsCard
        liquidPositions={stakingPositions?.liquid ?? []}
        nonLiquidPositions={stakingPositions?.nonLiquid ?? []}
        isLoading={isLoadingStaking}
      />

      {/* LP Positions */}
      <LiquidityPositionsCard
        positionsV2={lpPositionsV2 ?? []}
        positionsV3={lpPositionsV3 ?? []}
        isLoading={isLoadingLPV2 || isLoadingLPV3}
      />
    </div>
  );
}
