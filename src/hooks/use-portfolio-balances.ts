"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { formatUnits, type Address } from "viem";
import { fetchTokens } from "@/lib/api-client";
import { ERC20_ABI } from "@/lib/abis";
import { publicClient } from "@/lib/public-client";
import type { TokenBalance } from "@/lib/types/dashboard";

export function usePortfolioBalances() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["portfolioBalances", address],
    queryFn: async (): Promise<TokenBalance[]> => {
      console.log("[usePortfolioBalances] Starting query for address:", address);
      if (!address) return [];

      console.log("[usePortfolioBalances] Fetching tokens from API...");
      const { data: tokens } = await fetchTokens(1, 500);
      console.log("[usePortfolioBalances] Got", tokens.length, "tokens from API");

      const balanceCalls = tokens.map((token) => ({
        address: token.address as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf" as const,
        args: [address],
      }));

      console.log("[usePortfolioBalances] Making multicall for", balanceCalls.length, "tokens");
      const results = await publicClient.multicall({
        contracts: balanceCalls,
        allowFailure: true,
      });
      console.log("[usePortfolioBalances] Multicall complete, processing results");

      const balances = tokens
        .map((token, i) => {
          const result = results[i];
          if (result.status !== "success") return null;

          const balance = result.result as bigint;
          if (balance === 0n) return null;

          const priceUsd = Number.parseFloat(token.priceUsd || "0");
          const decimals = token.decimals || 18;
          const valueUsd = Number(formatUnits(balance, decimals)) * priceUsd;

          return {
            address: token.address as Address,
            symbol: token.symbol || "",
            name: token.name || "",
            decimals,
            balance,
            priceUsd,
            valueUsd,
          };
        })
        .filter((t): t is TokenBalance => t !== null && t.balance > 0n)
        .sort((a, b) => b.valueUsd - a.valueUsd);

      console.log("[usePortfolioBalances] Found", balances.length, "tokens with balance");
      return balances;
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
