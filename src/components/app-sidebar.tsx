"use client";

import {
  ArrowLeftRight,
  BarChart3,
  Coins,
  Home,
  Settings,
  Square,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Pairs",
    url: "/pairs",
    icon: TrendingUp,
  },
  {
    title: "Tokens",
    url: "/tokens",
    icon: Coins,
  },
  {
    title: "Blocks",
    url: "/blocks",
    icon: Square,
  },
  {
    title: "Transactions",
    url: "/txs",
    icon: ArrowLeftRight,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-4">
          <Image
            src="/logo-text.svg"
            alt="ZilStream"
            width={140}
            height={28}
            priority
            className="block h-7 w-auto dark:hidden"
          />
          <Image
            src="/logo-text-dark.svg"
            alt="ZilStream"
            width={140}
            height={28}
            priority
            className="hidden h-7 w-auto dark:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link
                      href={item.url}
                      className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
