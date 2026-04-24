import { WatchlistView } from "@/components/watchlist-view";

export default function WatchlistPage() {
  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Watchlist</h1>
        <p className="text-muted-foreground">
          Your starred tokens and pairs. Saved locally on this device.
        </p>
      </div>
      <WatchlistView />
    </div>
  );
}
