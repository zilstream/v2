import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlistContext } from "@/components/watchlist-provider";
import { cn } from "@/lib/utils";
import type { WatchlistKind } from "@/lib/watchlist";

interface WatchlistButtonProps {
  kind: WatchlistKind;
  address: string;
  className?: string;
}

export function WatchlistButton({
  kind,
  address,
  className,
}: WatchlistButtonProps) {
  const { toggle, isWatched, isLoaded } = useWatchlistContext();
  const active = isLoaded && isWatched(kind, address);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-pressed={active}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        toggle(kind, address);
      }}
      className={cn(
        "h-8 w-8 text-muted-foreground hover:text-yellow-500",
        active && "text-yellow-500 hover:text-yellow-500",
        className,
      )}
    >
      <Star
        className={cn("h-4 w-4", active && "fill-current")}
        strokeWidth={2}
      />
    </Button>
  );
}
