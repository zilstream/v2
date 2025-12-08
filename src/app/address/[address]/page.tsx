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

      <AddressEvents address={address} />

      <AddressTransactions address={address} />
    </div>
  );
}
