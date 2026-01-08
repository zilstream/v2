"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { formatUnits, type Address } from "viem";
import { useStats } from "@/hooks/use-zilstream-queries";
import { liquidDelegatorAbi } from "@/lib/stakingAbi";
import { ERC20_ABI } from "@/lib/abis";
import { publicClient } from "@/lib/public-client";
import {
  LIQUID_VALIDATORS,
  NON_LIQUID_VALIDATORS,
} from "@/lib/staking-validators";
import type {
  LiquidStakingPosition,
  NonLiquidStakingPosition,
} from "@/lib/types/dashboard";

export function useStakingPositions() {
  const { address, isConnected } = useAccount();
  const { data: stats } = useStats();
  const zilPriceUsd = Number.parseFloat(stats?.zilPriceUsd || "0");

  return useQuery({
    queryKey: ["stakingPositions", address, zilPriceUsd],
    queryFn: async () => {
      console.log("[useStakingPositions] Starting query for address:", address, "zilPriceUsd:", zilPriceUsd);
      if (!address) {
        return { liquid: [], nonLiquid: [] };
      }

      console.log("[useStakingPositions] Checking", LIQUID_VALIDATORS.length, "liquid validators");
      // Liquid staking: check LST token balances + exchange rates
      const liquidBalanceCalls = LIQUID_VALIDATORS.map((v) => ({
        address: v.lstAddress as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf" as const,
        args: [address],
      }));

      const liquidPriceCalls = LIQUID_VALIDATORS.map((v) => ({
        address: v.address as Address,
        abi: liquidDelegatorAbi,
        functionName: "getPrice" as const,
        args: [],
      }));

      // Non-liquid staking: check delegated amounts via getStake()
      // Note: These contracts use msg.sender context, so we query the user's stake
      // by calling getStake() which returns their delegated amount
      const nonLiquidCalls = NON_LIQUID_VALIDATORS.map((v) => ({
        address: v.address as Address,
        abi: [
          {
            inputs: [{ type: "address", name: "delegator" }],
            name: "getDelegatedStake",
            outputs: [{ type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ] as const,
        functionName: "getDelegatedStake" as const,
        args: [address],
      }));

      console.log("[useStakingPositions] Making multicalls...");
      const [liquidBalances, liquidPrices, nonLiquidResults] = await Promise.all(
        [
          publicClient.multicall({
            contracts: liquidBalanceCalls,
            allowFailure: true,
          }),
          publicClient.multicall({
            contracts: liquidPriceCalls,
            allowFailure: true,
          }),
          publicClient.multicall({
            contracts: nonLiquidCalls,
            allowFailure: true,
          }),
        ]
      );
      console.log("[useStakingPositions] Multicalls complete");
      console.log("[useStakingPositions] Liquid balances:", liquidBalances.map((r, i) => ({
        validator: LIQUID_VALIDATORS[i].name,
        status: r.status,
        result: r.status === 'success' ? r.result?.toString() : null
      })));

      // Process liquid staking
      const liquidPositions: LiquidStakingPosition[] = LIQUID_VALIDATORS.map(
        (v, i) => {
          const balanceResult = liquidBalances[i];
          const priceResult = liquidPrices[i];

          if (
            balanceResult.status !== "success" ||
            priceResult.status !== "success"
          ) {
            return null;
          }

          const balance = balanceResult.result as bigint;
          if (balance === 0n) return null;

          const exchangeRate = priceResult.result as bigint;
          const zilEquivalent = (balance * exchangeRate) / BigInt(1e18);
          const valueUsd = Number(formatUnits(zilEquivalent, 18)) * zilPriceUsd;

          return {
            validatorName: v.name,
            validatorAddress: v.address as Address,
            validatorIcon: v.iconUrl,
            lstToken: {
              address: v.lstAddress as Address,
              symbol: v.lstSymbol,
              balance,
              decimals: 18,
            },
            exchangeRate,
            zilEquivalent,
            valueUsd,
          };
        }
      ).filter((p): p is LiquidStakingPosition => p !== null);

      // Process non-liquid staking
      const nonLiquidPositions: NonLiquidStakingPosition[] =
        NON_LIQUID_VALIDATORS.map((v, i) => {
          const result = nonLiquidResults[i];

          if (result.status !== "success") return null;

          const delegatedAmount = result.result as bigint;
          if (delegatedAmount === 0n) return null;

          const valueUsd =
            Number(formatUnits(delegatedAmount, 18)) * zilPriceUsd;

          return {
            validatorName: v.name,
            validatorAddress: v.address as Address,
            validatorIcon: v.iconUrl,
            delegatedAmount,
            rewards: 0n,
            claimable: 0n,
            valueUsd,
          };
        }).filter((p): p is NonLiquidStakingPosition => p !== null);

      return { liquid: liquidPositions, nonLiquid: nonLiquidPositions };
    },
    enabled: isConnected && !!address,
    staleTime: 60_000,
  });
}
