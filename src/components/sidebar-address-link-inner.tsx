import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeftRight } from "lucide-react";
import { useAccount } from "wagmi";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function SidebarAddressLinkInner() {
  const { address } = useAccount();
  const pathname = useLocation({ select: (s) => s.pathname });

  if (!address) return null;

  const isActive = pathname.startsWith("/address");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          to="/address/$address"
          params={{ address }}
          className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
        >
          <ArrowLeftRight />
          <span>Transactions</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
