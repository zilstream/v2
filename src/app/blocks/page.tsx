import { LiveBlocksSection } from "@/components/live-blocks-section";

export default function BlocksPage() {
  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Blocks</h1>
        <p className="text-muted-foreground">
          Recent blocks on the Zilliqa network.
        </p>
      </div>

      <LiveBlocksSection />
    </div>
  );
}
