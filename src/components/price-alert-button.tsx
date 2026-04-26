import { Bell } from "lucide-react";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useWalletReady } from "@/components/wallet-ready-context";

const PriceAlertButtonInner = lazy(() =>
  import("./price-alert-button-inner").then((m) => ({
    default: m.PriceAlertButtonInner,
  })),
);

interface PriceAlertButtonProps {
  token: {
    address: string;
    symbol?: string;
    name?: string;
    priceUsd?: string;
  };
}

function PriceAlertButtonPlaceholder() {
  return (
    <Button variant="outline" size="icon" disabled>
      <Bell className="h-4 w-4" />
    </Button>
  );
}

export function PriceAlertButton(props: PriceAlertButtonProps) {
  const ready = useWalletReady();
  if (!ready) return <PriceAlertButtonPlaceholder />;
  return (
    <Suspense fallback={<PriceAlertButtonPlaceholder />}>
      <PriceAlertButtonInner {...props} />
    </Suspense>
  );
}
