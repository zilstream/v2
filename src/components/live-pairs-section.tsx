"use client";

import { useState, useEffect } from "react";
import { PairsTable } from "@/components/pairs-table";
import { PairsTableSkeleton } from "@/components/pairs-table-skeleton";
import type { Pair } from "@/lib/zilstream";
import { useBatchPairsSubscription } from "@/hooks/use-websocket";
import { usePairs } from "@/hooks/use-zilstream-queries";

export function LivePairsSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePairs(page, 50);
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

  if (isLoading && pairs.length === 0) {
    return <PairsTableSkeleton title="Live Pairs" />;
  }

  return (
    <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      <PairsTable
        pairs={pairs}
        pagination={data?.pagination}
        title="Live Pairs"
        onPageChange={handlePageChange}
      />
    </div>
  );
}
