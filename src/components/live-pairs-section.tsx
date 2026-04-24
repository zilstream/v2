"use client";

import { useEffect, useState } from "react";
import { PairsTable } from "@/components/pairs-table";
import { PairsTableSkeleton } from "@/components/pairs-table-skeleton";
import { useTableParams } from "@/hooks/use-table-params";
import { useBatchPairsSubscription } from "@/hooks/use-websocket";
import { usePairs } from "@/hooks/use-zilstream-queries";
import type { Pair } from "@/lib/zilstream";

const PAIRS_SORT_DEFAULT = { sortBy: "volume_24h", sortOrder: "desc" } as const;

export function LivePairsSection() {
  const { search, sortBy, sortOrder, page, setSearch, toggleSort, setPage } =
    useTableParams(PAIRS_SORT_DEFAULT);
  const { data, isLoading } = usePairs(page, 50, {
    search: search || undefined,
    sortBy,
    sortOrder,
  });
  const [pairs, setPairs] = useState<Pair[]>([]);

  useEffect(() => {
    if (data?.data) {
      setPairs(data.data);
    }
  }, [data?.data]);

  useBatchPairsSubscription((updatedPairs) => {
    setPairs((currentPairs) => {
      const newPairs = [...currentPairs];
      let hasChanges = false;

      for (const updatedPair of updatedPairs) {
        const index = newPairs.findIndex(
          (p) => p.address.toLowerCase() === updatedPair.address.toLowerCase(),
        );
        if (index !== -1) {
          newPairs[index] = updatedPair;
          hasChanges = true;
        }
      }

      return hasChanges ? newPairs : currentPairs;
    });
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading && pairs.length === 0 && !search) {
    return <PairsTableSkeleton title="Live Pairs" />;
  }

  return (
    <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      <PairsTable
        pairs={pairs}
        pagination={data?.pagination}
        title="Live Pairs"
        onPageChange={handlePageChange}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={toggleSort}
      />
    </div>
  );
}
