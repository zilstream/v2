import type { ReactNode } from "react";
import { useWalletReady } from "@/components/wallet-ready-context";

function DefaultFallback() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function WalletReadyGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const ready = useWalletReady();
  if (!ready) return <>{fallback ?? <DefaultFallback />}</>;
  return <>{children}</>;
}
