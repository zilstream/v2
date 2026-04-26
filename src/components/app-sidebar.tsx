import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Bell,
  Coins,
  CreditCard,
  Download,
  Home,
  LayoutDashboard,
  Newspaper,
  Square,
  Star,
  TrendingUp,
} from "lucide-react";

import { SidebarAddressLink } from "@/components/sidebar-address-link";
import { SidebarMembershipBanner } from "@/components/sidebar-membership-banner";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Home", to: "/", icon: Home },
  { title: "Pairs", to: "/pairs", icon: TrendingUp },
  { title: "Tokens", to: "/tokens", icon: Coins },
  { title: "Swap", to: "/swap", icon: ArrowLeftRight },
  { title: "Watchlist", to: "/watchlist", icon: Star },
  { title: "Blocks", to: "/blocks", icon: Square },
  { title: "Transactions", to: "/txs", icon: ArrowLeftRight },
] as const;

const portfolioStaticItems = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Alerts", to: "/alerts", icon: Bell },
] as const;

const portfolioFooterItems = [
  { title: "Exports", to: "/exports", icon: Download },
  { title: "Membership", to: "/membership", icon: CreditCard },
] as const;

const resourcesItems = [
  { title: "News", to: "/news", icon: Newspaper },
] as const;

export function AppSidebar() {
  const pathname = useLocation({ select: (s) => s.pathname });

  const isActive = (itemPath: string) => {
    if (pathname === itemPath) return true;
    if (itemPath === "/") return false;
    if (itemPath === "/blocks" && pathname.startsWith("/block")) return true;
    if (itemPath === "/txs" && pathname.startsWith("/tx")) return true;
    if (itemPath.startsWith("/address")) return pathname.startsWith("/address");
    return pathname.startsWith(itemPath);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-4">
          <img
            src="/logo-text.svg"
            alt="ZilStream"
            width={140}
            height={28}
            className="block h-7 w-auto dark:hidden"
          />
          <img
            src="/logo-text-dark.svg"
            alt="ZilStream"
            width={140}
            height={28}
            className="hidden h-7 w-auto dark:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link
                      to={item.to}
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

        <SidebarGroup>
          <SidebarGroupLabel>Portfolio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portfolioStaticItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link
                      to={item.to}
                      className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarAddressLink />
              {portfolioFooterItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link
                      to={item.to}
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

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link
                      to={item.to}
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
      <SidebarFooter>
        <SidebarMembershipBanner />
        <div className="mx-2 mb-2">
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
