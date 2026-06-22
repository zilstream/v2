import { lazy, Suspense } from "react";
import type { SwapWidgetProps } from "@/components/swap-widget-inner";
import { useWalletReady } from "@/components/wallet-ready-context";

const SwapWidgetInner = lazy(() =>
  import("./swap-widget-inner").then((m) => ({
    default: m.SwapWidgetInner,
  })),
);

function SwapWidgetPlaceholder() {
  return (
    <div className="flex h-[420px] animate-pulse flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm" />
  );
}

export function SwapWidget(props: SwapWidgetProps) {
  const ready = useWalletReady();
  if (!ready) return <SwapWidgetPlaceholder />;
  return (
    <Suspense fallback={<SwapWidgetPlaceholder />}>
      <SwapWidgetInner {...props} />
    </Suspense>
  );
}
