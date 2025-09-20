"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  {
    href: "/pairs",
    label: "Pairs",
    match: (path: string) => path.startsWith("/pairs"),
  },
  {
    href: "/tokens",
    label: "Tokens",
    match: (path: string) => path.startsWith("/tokens"),
  },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="relative flex items-center"
          aria-label="ZilStream home"
        >
          <div className="relative z-10 flex items-center gap-2">
            <Image
              src="/logo-text.svg"
              alt=""
              width={160}
              height={32}
              priority
              className="block h-8 w-auto dark:hidden"
            />
            <Image
              src="/logo-text-dark.svg"
              alt=""
              width={160}
              height={32}
              priority
              className="hidden h-8 w-auto dark:block"
            />
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
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 transition-colors",
                  isActive
                    ? "border border-primary/20 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
