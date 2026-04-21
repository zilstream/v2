"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAddressEvents,
  fetchAddressTransactions,
  fetchBlockByNumber,
  fetchBlocks,
  fetchPairByAddress,
  fetchPairChart,
  fetchPairEvents,
  fetchPairs,
  fetchStats,
  fetchTokenByAddress,
  fetchTokenChart,
  fetchTokenPairs,
  fetchTokens,
  fetchTransactionByHash,
  fetchTransactions,
  type ListQueryOptions,
} from "@/lib/api-client";

// Stats
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}

// Pairs
export function usePairs(page = 1, perPage = 50, options?: ListQueryOptions) {
  return useQuery({
    queryKey: ["pairs", page, perPage, options ?? null],
    queryFn: () => fetchPairs(page, perPage, options),
  });
}

export function usePair(address: string) {
  return useQuery({
    queryKey: ["pair", address],
    queryFn: () => fetchPairByAddress(address),
    enabled: !!address,
  });
}

export function usePairEvents(address: string) {
  return useQuery({
    queryKey: ["pairEvents", address],
    queryFn: () => fetchPairEvents(address),
    enabled: !!address,
  });
}

export function usePairChart(address: string) {
  return useQuery({
    queryKey: ["pairChart", address],
    queryFn: () => fetchPairChart(address),
    enabled: !!address,
    staleTime: 5 * 60_000,
  });
}

// Tokens
export function useTokens(page = 1, perPage = 100, options?: ListQueryOptions) {
  return useQuery({
    queryKey: ["tokens", page, perPage, options ?? null],
    queryFn: () => fetchTokens(page, perPage, options),
  });
}

export function useToken(address: string) {
  return useQuery({
    queryKey: ["token", address],
    queryFn: () => fetchTokenByAddress(address),
    enabled: !!address,
  });
}

export function useTokenPairs(address: string, page = 1, perPage = 25) {
  return useQuery({
    queryKey: ["tokenPairs", address, page, perPage],
    queryFn: () => fetchTokenPairs(address, page, perPage),
    enabled: !!address,
  });
}

export function useTokenChart(address: string) {
  return useQuery({
    queryKey: ["tokenChart", address],
    queryFn: () => fetchTokenChart(address),
    enabled: !!address,
    staleTime: 5 * 60_000,
  });
}

// Blocks
export function useBlocks(page = 1, perPage = 25) {
  return useQuery({
    queryKey: ["blocks", page, perPage],
    queryFn: () => fetchBlocks(page, perPage),
  });
}

export function useBlock(blockNumber: number) {
  return useQuery({
    queryKey: ["block", blockNumber],
    queryFn: () => fetchBlockByNumber(blockNumber),
    enabled: blockNumber > 0,
  });
}

// Transactions
export function useTransactions(page = 1, perPage = 25) {
  return useQuery({
    queryKey: ["transactions", page, perPage],
    queryFn: () => fetchTransactions(page, perPage),
  });
}

export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ["transaction", hash],
    queryFn: () => fetchTransactionByHash(hash),
    enabled: !!hash,
  });
}

// Address
export function useAddressTransactions(
  address: string,
  page = 1,
  perPage = 25,
) {
  return useQuery({
    queryKey: ["addressTransactions", address, page, perPage],
    queryFn: () => fetchAddressTransactions(address, page, perPage),
    enabled: !!address,
  });
}

export function useAddressEvents(address: string, page = 1, perPage = 25) {
  return useQuery({
    queryKey: ["addressEvents", address, page, perPage],
    queryFn: () => fetchAddressEvents(address, page, perPage),
    enabled: !!address,
  });
}
