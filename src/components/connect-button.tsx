import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useWalletReady } from "@/components/wallet-ready-context";

const ConnectWalletButtonInner = lazy(() =>
  import("./connect-button-inner").then((m) => ({
    default: m.ConnectWalletButtonInner,
  })),
);

function ConnectPlaceholder() {
  return (
    <Button variant="outline" size="sm" disabled>
      Connect Wallet
    </Button>
  );
}

export function ConnectWalletButton() {
  const ready = useWalletReady();
  if (!ready) return <ConnectPlaceholder />;
  return (
    <Suspense fallback={<ConnectPlaceholder />}>
      <ConnectWalletButtonInner />
    </Suspense>
  );
}
