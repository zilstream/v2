import { LiveTransactionsSection } from "@/components/live-transactions-section";
import { fetchTransactions } from "@/lib/zilstream";

export default async function TransactionsPage() {
  const { data: transactions, pagination } = await fetchTransactions();

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-muted-foreground">
          Recent transactions on the Zilliqa network.
        </p>
      </div>

      <LiveTransactionsSection
        initialTransactions={transactions}
        initialPagination={pagination}
      />
    </div>
  );
}
