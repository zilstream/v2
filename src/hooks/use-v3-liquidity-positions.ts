"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { formatUnits, type Address } from "viem";
import { fetchTokens } from "@/lib/api-client";
import {
  PLUNDERSWAP_V3_POSITION_MANAGER,
  PLUNDERSWAP_V3_FACTORY,
  V3_POSITION_MANAGER_ABI,
  V3_FACTORY_ABI,
  V3_POOL_SLOT0_ABI,
  ERC20_ABI,
} from "@/lib/abis";
import { publicClient } from "@/lib/public-client";
import type { LPPositionV3 } from "@/lib/types/dashboard";

// Uniswap V3 math helpers
const Q96 = 2n ** 96n;

function tickToSqrtPriceX96(tick: number): bigint {
  const absTick = Math.abs(tick);
  let ratio =
    (absTick & 0x1) !== 0
      ? 0xfffcb933bd6fad37aa2d162d1a594001n
      : 0x100000000000000000000000000000000n;
  if ((absTick & 0x2) !== 0)
    ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
  if ((absTick & 0x4) !== 0)
    ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if ((absTick & 0x8) !== 0)
    ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if ((absTick & 0x10) !== 0)
    ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if ((absTick & 0x20) !== 0)
    ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if ((absTick & 0x40) !== 0)
    ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if ((absTick & 0x80) !== 0)
    ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if ((absTick & 0x100) !== 0)
    ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if ((absTick & 0x200) !== 0)
    ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if ((absTick & 0x400) !== 0)
    ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if ((absTick & 0x800) !== 0)
    ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if ((absTick & 0x1000) !== 0)
    ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if ((absTick & 0x2000) !== 0)
    ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if ((absTick & 0x4000) !== 0)
    ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if ((absTick & 0x8000) !== 0)
    ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if ((absTick & 0x10000) !== 0)
    ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if ((absTick & 0x20000) !== 0)
    ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if ((absTick & 0x40000) !== 0)
    ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if ((absTick & 0x80000) !== 0)
    ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;

  if (tick > 0) ratio = (2n ** 256n - 1n) / ratio;
  return (ratio >> 32n) + (ratio % (1n << 32n) === 0n ? 0n : 1n);
}

function getAmount0ForLiquidity(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): bigint {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  }
  return (
    (liquidity * Q96 * (sqrtRatioBX96 - sqrtRatioAX96)) /
    sqrtRatioBX96 /
    sqrtRatioAX96
  );
}

function getAmount1ForLiquidity(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): bigint {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  }
  return (liquidity * (sqrtRatioBX96 - sqrtRatioAX96)) / Q96;
}

function getTokenAmounts(
  liquidity: bigint,
  sqrtPriceX96: bigint,
  tickLower: number,
  tickUpper: number
): { amount0: bigint; amount1: bigint } {
  const sqrtRatioAX96 = tickToSqrtPriceX96(tickLower);
  const sqrtRatioBX96 = tickToSqrtPriceX96(tickUpper);

  let amount0 = 0n;
  let amount1 = 0n;

  if (sqrtPriceX96 <= sqrtRatioAX96) {
    // Current price below range - all token0
    amount0 = getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
  } else if (sqrtPriceX96 < sqrtRatioBX96) {
    // Current price in range
    amount0 = getAmount0ForLiquidity(sqrtPriceX96, sqrtRatioBX96, liquidity);
    amount1 = getAmount1ForLiquidity(sqrtRatioAX96, sqrtPriceX96, liquidity);
  } else {
    // Current price above range - all token1
    amount1 = getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
  }

  return { amount0, amount1 };
}

export function useV3LiquidityPositions() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["v3LiquidityPositions", address],
    queryFn: async (): Promise<LPPositionV3[]> => {
      console.log("[useV3LiquidityPositions] Starting query for address:", address);
      if (!address) return [];

      console.log("[useV3LiquidityPositions] Checking V3 position NFT count...");
      // Get number of positions owned by user
      const balanceResult = await publicClient.readContract({
        address: PLUNDERSWAP_V3_POSITION_MANAGER,
        abi: V3_POSITION_MANAGER_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      const positionCount = Number(balanceResult);
      console.log("[useV3LiquidityPositions] User has", positionCount, "V3 positions");
      if (positionCount === 0) return [];

      // Get all token IDs
      const tokenIdCalls = Array.from({ length: positionCount }, (_, i) => ({
        address: PLUNDERSWAP_V3_POSITION_MANAGER as Address,
        abi: V3_POSITION_MANAGER_ABI,
        functionName: "tokenOfOwnerByIndex" as const,
        args: [address, BigInt(i)],
      }));

      const tokenIdResults = await publicClient.multicall({
        contracts: tokenIdCalls,
        allowFailure: true,
      });

      const tokenIds = tokenIdResults
        .filter((r) => r.status === "success")
        .map((r) => r.result as bigint);

      if (tokenIds.length === 0) return [];

      // Get position details for all token IDs
      const positionCalls = tokenIds.map((tokenId) => ({
        address: PLUNDERSWAP_V3_POSITION_MANAGER as Address,
        abi: V3_POSITION_MANAGER_ABI,
        functionName: "positions" as const,
        args: [tokenId],
      }));

      const positionResults = await publicClient.multicall({
        contracts: positionCalls,
        allowFailure: true,
      });

      // Parse position data and filter active positions
      const positions: Array<{
        tokenId: bigint;
        token0: Address;
        token1: Address;
        fee: number;
        tickLower: number;
        tickUpper: number;
        liquidity: bigint;
        tokensOwed0: bigint;
        tokensOwed1: bigint;
      }> = [];

      for (let i = 0; i < positionResults.length; i++) {
        const result = positionResults[i];
        if (result.status !== "success") continue;

        const data = result.result as [
          bigint, // nonce
          Address, // operator
          Address, // token0
          Address, // token1
          number, // fee
          number, // tickLower
          number, // tickUpper
          bigint, // liquidity
          bigint, // feeGrowthInside0LastX128
          bigint, // feeGrowthInside1LastX128
          bigint, // tokensOwed0
          bigint // tokensOwed1
        ];

        const liquidity = data[7];
        // Skip closed positions (no liquidity)
        if (liquidity === 0n) continue;

        positions.push({
          tokenId: tokenIds[i],
          token0: data[2],
          token1: data[3],
          fee: data[4],
          tickLower: data[5],
          tickUpper: data[6],
          liquidity,
          tokensOwed0: data[10],
          tokensOwed1: data[11],
        });
      }

      if (positions.length === 0) return [];

      // Get pool addresses for each position
      const poolCalls = positions.map((pos) => ({
        address: PLUNDERSWAP_V3_FACTORY as Address,
        abi: V3_FACTORY_ABI,
        functionName: "getPool" as const,
        args: [pos.token0, pos.token1, pos.fee],
      }));

      const poolResults = await publicClient.multicall({
        contracts: poolCalls,
        allowFailure: true,
      });

      // Get slot0 for each pool
      const slot0Calls = poolResults.map((result) => {
        const poolAddress =
          result.status === "success" ? (result.result as Address) : null;
        return poolAddress
          ? {
              address: poolAddress,
              abi: V3_POOL_SLOT0_ABI,
              functionName: "slot0" as const,
              args: [],
            }
          : null;
      });

      const validSlot0Calls = slot0Calls.filter((c) => c !== null);
      const slot0Results = await publicClient.multicall({
        contracts: validSlot0Calls,
        allowFailure: true,
      });

      // Get token decimals for all unique tokens
      const uniqueTokens = [
        ...new Set(positions.flatMap((p) => [p.token0, p.token1])),
      ];

      const decimalsCalls = uniqueTokens.map((token) => ({
        address: token,
        abi: ERC20_ABI,
        functionName: "decimals" as const,
        args: [],
      }));

      const decimalsResults = await publicClient.multicall({
        contracts: decimalsCalls,
        allowFailure: true,
      });

      const tokenDecimals: Record<string, number> = {};
      for (let i = 0; i < uniqueTokens.length; i++) {
        const result = decimalsResults[i];
        tokenDecimals[uniqueTokens[i].toLowerCase()] =
          result.status === "success" ? Number(result.result) : 18;
      }

      // Fetch tokens from API for prices and symbols
      const { data: apiTokens } = await fetchTokens(1, 500);
      const tokenPrices: Record<string, number> = {};
      const tokenSymbols: Record<string, string> = {};

      for (const token of apiTokens) {
        tokenPrices[token.address.toLowerCase()] = Number.parseFloat(
          token.priceUsd || "0"
        );
        tokenSymbols[token.address.toLowerCase()] = token.symbol || "???";
      }

      // Build final positions
      const lpPositions: LPPositionV3[] = [];
      let slot0Index = 0;

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const poolResult = poolResults[i];

        if (poolResult.status !== "success") continue;

        const poolAddress = poolResult.result as Address;
        const slot0Result = slot0Results[slot0Index++];

        if (!slot0Result || slot0Result.status !== "success") continue;

        const slot0Data = slot0Result.result as [
          bigint, // sqrtPriceX96
          number, // tick
          number,
          number,
          number,
          number,
          boolean
        ];

        const sqrtPriceX96 = slot0Data[0];
        const currentTick = slot0Data[1];
        const inRange = currentTick >= pos.tickLower && currentTick < pos.tickUpper;

        const { amount0, amount1 } = getTokenAmounts(
          pos.liquidity,
          sqrtPriceX96,
          pos.tickLower,
          pos.tickUpper
        );

        const token0Lower = pos.token0.toLowerCase();
        const token1Lower = pos.token1.toLowerCase();

        const token0Decimals = tokenDecimals[token0Lower] || 18;
        const token1Decimals = tokenDecimals[token1Lower] || 18;

        const token0Price = tokenPrices[token0Lower] || 0;
        const token1Price = tokenPrices[token1Lower] || 0;

        const amount0Formatted = Number(formatUnits(amount0, token0Decimals));
        const amount1Formatted = Number(formatUnits(amount1, token1Decimals));

        const fees0Formatted = Number(
          formatUnits(pos.tokensOwed0, token0Decimals)
        );
        const fees1Formatted = Number(
          formatUnits(pos.tokensOwed1, token1Decimals)
        );

        const valueUsd =
          amount0Formatted * token0Price + amount1Formatted * token1Price;
        const feesUsd =
          fees0Formatted * token0Price + fees1Formatted * token1Price;

        lpPositions.push({
          tokenId: pos.tokenId,
          poolAddress,
          token0: {
            address: pos.token0,
            symbol: tokenSymbols[token0Lower] || "???",
            decimals: token0Decimals,
          },
          token1: {
            address: pos.token1,
            symbol: tokenSymbols[token1Lower] || "???",
            decimals: token1Decimals,
          },
          feeTier: pos.fee,
          tickLower: pos.tickLower,
          tickUpper: pos.tickUpper,
          currentTick,
          inRange,
          liquidity: pos.liquidity,
          token0Amount: amount0,
          token1Amount: amount1,
          uncollectedFees0: pos.tokensOwed0,
          uncollectedFees1: pos.tokensOwed1,
          valueUsd,
          feesUsd,
        });
      }

      return lpPositions.sort((a, b) => b.valueUsd - a.valueUsd);
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
