import { lazy, Suspense } from "react";
import { useWalletReady } from "@/components/wallet-ready-context";

const SidebarAddressLinkInner = lazy(() =>
  import("./sidebar-address-link-inner").then((m) => ({
    default: m.SidebarAddressLinkInner,
  })),
);

export function SidebarAddressLink() {
  const ready = useWalletReady();
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <SidebarAddressLinkInner />
    </Suspense>
  );
}
