"use client";

import { useState } from "react";
import { PairsTable } from "@/components/pairs-table";
import type { Pair, Pagination } from "@/lib/zilstream";

interface PairsPageSectionProps {
  initialPairs: Pair[];
  initialPagination: Pagination;
}

export function PairsPageSection({
  initialPairs,
  initialPagination,
}: PairsPageSectionProps) {
  const [pairs, setPairs] = useState(initialPairs);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pairs?page=${newPage}&per_page=50`);
      const data = await response.json();
      setPairs(data.data);
      setPagination(data.pagination);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to fetch pairs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      <PairsTable
        pairs={pairs}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
