import { TokensTableClient } from "@/components/tokens-table-client";

export default function TokensPage() {
  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Tokens</h1>
        <p className="text-muted-foreground">
          Listing of assets returned by the ZilStream API token endpoint.
        </p>
      </div>

      <TokensTableClient />
    </div>
  );
}
