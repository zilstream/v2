"use client";

import { useState } from "react";
import { BlocksTable } from "@/components/blocks-table";
import { useBlocks } from "@/hooks/use-zilstream-queries";

export function LiveBlocksSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBlocks(page, 25);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading && !data) {
    return <BlocksTable blocks={[]} isLoading />;
  }

  return (
    <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      <BlocksTable
        blocks={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
