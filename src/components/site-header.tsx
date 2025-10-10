"use client";

import { Suspense } from "react";

import { HeaderStats } from "@/components/header-stats";
import { SearchBar } from "@/components/search-bar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="rounded-full bg-orange-200/70 px-3 py-0.5 text-xs font-medium uppercase tracking-wide text-orange-700">
                Early preview
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={10}
              className="max-w-xs text-left"
            >
              This is early access—the interface and data views will continue
              to evolve rapidly.
            </TooltipContent>
          </Tooltip>
        </div>
        <SearchBar />
        <Suspense fallback={<Skeleton className="h-5 w-64" />}>
          <HeaderStats />
        </Suspense>
      </div>
    </header>
  );
}
