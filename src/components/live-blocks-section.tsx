"use client";

import { useState } from "react";
import { BlocksTable } from "@/components/blocks-table";
import type { Block, Pagination } from "@/lib/zilstream";

interface LiveBlocksSectionProps {
  initialBlocks: Block[];
  initialPagination: Pagination;
}

export function LiveBlocksSection({
  initialBlocks,
  initialPagination,
}: LiveBlocksSectionProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blocks?page=${newPage}&per_page=50`);
      const data = await response.json();
      setBlocks(data.data);
      setPagination(data.pagination);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      <BlocksTable
        blocks={blocks}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
