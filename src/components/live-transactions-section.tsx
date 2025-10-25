"use client";

import { useState } from "react";
import { TransactionsTable } from "@/components/transactions-table";
import type { Transaction, Pagination } from "@/lib/zilstream";

interface LiveTransactionsSectionProps {
  initialTransactions: Transaction[];
  initialPagination: Pagination;
}

export function LiveTransactionsSection({
  initialTransactions,
  initialPagination,
}: LiveTransactionsSectionProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/transactions?page=${newPage}&per_page=50`,
      );
      const data = await response.json();
      setTransactions(data.data);
      setPagination(data.pagination);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      <TransactionsTable
        transactions={transactions}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
