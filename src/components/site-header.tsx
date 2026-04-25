import { Link } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { ConnectWalletButton } from "@/components/connect-button";
import { HeaderStats } from "@/components/header-stats";
import { MembershipBadge } from "@/components/membership-badge";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ZilStreamLogo } from "@/components/zilstream-logo";

export function SiteHeader() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between gap-2 px-3 md:gap-6 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger />
          <Link to="/" className="md:hidden">
            <ZilStreamLogo className="h-8 w-8 text-primary" />
          </Link>
        </div>
        <div className="hidden flex-1 md:flex md:justify-center">
          <SearchBar />
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
          >
            <SearchIcon />
          </Button>
          <div className="hidden lg:block">
            <Suspense fallback={<Skeleton className="h-5 w-64" />}>
              <HeaderStats />
            </Suspense>
          </div>
          <div className="ml-1 md:ml-2">
            <MembershipBadge />
          </div>
          <div className="ml-1 md:ml-2">
            <ConnectWalletButton />
          </div>
        </div>
      </div>

      <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <SheetContent side="top" className="w-full">
          <SheetHeader className="px-4">
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-4">
            <SearchBar />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
