import { AddressInfo } from "@/components/address-info";
import { AddressEvents } from "@/components/address-events";
import { AddressTransactions } from "@/components/address-transactions";
import { CopyButton } from "@/components/copy-button";
import { ExplorerDropdown } from "@/components/explorer-dropdown";

export default async function AddressPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  const [txResponse, eventsResponse] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/addresses/${address}/transactions?page=1&per_page=25`,
      { next: { revalidate: 60 } },
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/addresses/${address}/events?page=1&per_page=10`,
      { next: { revalidate: 60 } },
    ),
  ]);

  const txResult = await txResponse.json();
  const transactions = txResult?.data || [];
  const hasMoreTx = 
    txResult?.pagination?.has_next || 
    (transactions.length === 25);

  const eventsResult = await eventsResponse.json();
  const events = eventsResult?.data || [];
  const hasMoreEvents = 
    eventsResult?.pagination?.has_next || 
    (events.length === 10);

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Address</h1>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-muted-foreground break-all">
                {address}
              </p>
              <CopyButton text={address} />
            </div>
          </div>
          <ExplorerDropdown type="address" value={address} />
        </div>
        <AddressInfo address={address} />
      </div>

      <AddressEvents 
        initialEvents={events}
        initialHasMore={hasMoreEvents}
        address={address}
      />

      <AddressTransactions
        initialTransactions={transactions}
        initialHasMore={hasMoreTx}
        address={address}
      />
    </div>
  );
}
