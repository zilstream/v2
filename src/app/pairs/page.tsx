import { PairsPageSection } from "@/components/pairs-page-section";
import { fetchPairs } from "@/lib/zilstream";

export default async function PairsPage() {
  const { data: pairs, pagination } = await fetchPairs(1, 50);

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Pairs</h1>
        <p className="text-muted-foreground">
          Overview of available liquidity pairs and their on-chain metrics.
        </p>
      </div>

      <PairsPageSection initialPairs={pairs} initialPagination={pagination} />
    </div>
  );
}
