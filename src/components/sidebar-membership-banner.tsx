import { Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWalletReady } from "@/components/wallet-ready-context";
import { ZilStreamLogo } from "@/components/zilstream-logo";

const SidebarMembershipBannerInner = lazy(() =>
  import("./sidebar-membership-banner-inner").then((m) => ({
    default: m.SidebarMembershipBannerInner,
  })),
);

function SidebarMembershipBannerPlaceholder() {
  return (
    <Card className="mx-2 mb-2 gap-0 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-0 shadow-none">
      <div className="p-4">
        <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-primary">
          <ZilStreamLogo className="h-4 w-4" />
          ZilStream Membership
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          Acquire your yearly membership with STREAM
        </p>
        <Button
          asChild
          size="sm"
          className="h-7 w-full bg-primary text-xs font-medium text-primary-foreground shadow-none hover:bg-primary/90"
        >
          <Link to="/membership">Get Membership</Link>
        </Button>
      </div>
    </Card>
  );
}

export function SidebarMembershipBanner() {
  const ready = useWalletReady();
  if (!ready) return <SidebarMembershipBannerPlaceholder />;
  return (
    <Suspense fallback={<SidebarMembershipBannerPlaceholder />}>
      <SidebarMembershipBannerInner />
    </Suspense>
  );
}
