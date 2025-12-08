"use client";

import { useState } from "react";
import { TransactionsTable } from "@/components/transactions-table";
import { useTransactions } from "@/hooks/use-zilstream-queries";

export function LiveTransactionsSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTransactions(page, 25);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading && !data) {
    return <TransactionsTable transactions={[]} isLoading />;
  }

  return (
    <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      <TransactionsTable
        transactions={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
