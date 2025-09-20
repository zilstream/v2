import { PairsTable } from "@/components/pairs-table";
import { fetchPairs } from "@/lib/zilstream";

export default async function PairsPage() {
  const { data: pairs, pagination } = await fetchPairs();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Pairs</h1>
        <p className="text-muted-foreground">
          Overview of available liquidity pairs and their on-chain metrics.
        </p>
      </div>

      <PairsTable pairs={pairs} pagination={pagination} />
    </div>
  );
}
