"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { formatUnits, type Address } from "viem";
import { fetchPairs } from "@/lib/api-client";
import { ERC20_ABI } from "@/lib/abis";
import { publicClient } from "@/lib/public-client";
import type { LPPositionV2 } from "@/lib/types/dashboard";

const UNISWAP_V2_PAIR_ABI = [
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getReserves",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "reserve0", type: "uint112" },
      { name: "reserve1", type: "uint112" },
      { name: "blockTimestampLast", type: "uint32" },
    ],
  },
] as const;

export function useLiquidityPositions() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["liquidityPositions", address],
    queryFn: async (): Promise<LPPositionV2[]> => {
      if (!address) return [];

      // Fetch PlunderSwap V2 pairs (V2 has no fee field)
      const { data: pairs } = await fetchPairs(1, 200);
      const v2Pairs = pairs.filter((p) => !p.fee);

      // Check LP balances for all pairs
      const balanceCalls = v2Pairs.map((pair) => ({
        address: pair.address as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf" as const,
        args: [address],
      }));

      const balanceResults = await publicClient.multicall({
        contracts: balanceCalls,
        allowFailure: true,
      });

      // Filter pairs with balance
      const pairsWithBalance: Array<{
        pair: (typeof v2Pairs)[number];
        balance: bigint;
        index: number;
      }> = [];

      for (let i = 0; i < v2Pairs.length; i++) {
        const result = balanceResults[i];
        if (result.status === "success") {
          const balance = result.result as bigint;
          if (balance > 0n) {
            pairsWithBalance.push({ pair: v2Pairs[i], balance, index: i });
          }
        }
      }

      if (pairsWithBalance.length === 0) return [];

      // Get totalSupply and reserves for pairs with balance
      const detailCalls = pairsWithBalance.flatMap(({ pair }) => [
        {
          address: pair.address as Address,
          abi: UNISWAP_V2_PAIR_ABI,
          functionName: "totalSupply" as const,
          args: [],
        },
        {
          address: pair.address as Address,
          abi: UNISWAP_V2_PAIR_ABI,
          functionName: "getReserves" as const,
          args: [],
        },
      ]);

      const detailResults = await publicClient.multicall({
        contracts: detailCalls,
        allowFailure: true,
      });

      return pairsWithBalance
        .map(({ pair, balance }, i) => {
          const totalSupplyResult = detailResults[i * 2];
          const reservesResult = detailResults[i * 2 + 1];

          if (
            totalSupplyResult.status !== "success" ||
            reservesResult.status !== "success"
          ) {
            return null;
          }

          const totalSupply = totalSupplyResult.result as bigint;
          const [reserve0, reserve1] = reservesResult.result as [
            bigint,
            bigint,
            number,
          ];

          if (totalSupply === 0n) return null;

          const share = (balance * BigInt(1e18)) / totalSupply;
          const token0Amount = (reserve0 * share) / BigInt(1e18);
          const token1Amount = (reserve1 * share) / BigInt(1e18);
          const sharePercent = Number(formatUnits(share, 18));

          const liquidityUsd = Number.parseFloat(pair.liquidityUsd || "0");
          const valueUsd = liquidityUsd * sharePercent;

          return {
            pairAddress: pair.address as Address,
            token0: {
              address: pair.token0 as Address,
              symbol: pair.token0Symbol,
            },
            token1: {
              address: pair.token1 as Address,
              symbol: pair.token1Symbol,
            },
            lpBalance: balance,
            totalSupply,
            reserve0,
            reserve1,
            token0Amount,
            token1Amount,
            sharePercent,
            valueUsd,
          };
        })
        .filter((p): p is LPPositionV2 => p !== null && p.valueUsd > 0.01)
        .sort((a, b) => b.valueUsd - a.valueUsd);
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
