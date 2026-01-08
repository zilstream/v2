"use client";

import { Bell, Crown, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { ConnectWalletButton } from "@/components/connect-button";
import { usePriceAlertsContext } from "@/components/price-alerts-provider";
import { TokenIcon } from "@/components/token-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";
import { formatAlertDescription } from "@/lib/price-alerts";

export default function AlertsPage() {
  const { isConnected, address } = useAccount();

  const { data: hasActiveMembership, isLoading: isMembershipLoading } =
    useReadContract({
      address: MEMBERSHIP_NFT_ADDRESS,
      abi: MEMBERSHIP_NFT_ABI,
      functionName: "hasActiveMembership",
      args: [address ?? "0x0"],
      query: { enabled: !!address },
    });

  if (!isConnected || !address) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <Card className="w-full max-w-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to manage your price alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectWalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMembershipLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasActiveMembership) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <Card className="w-full max-w-xl text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">Membership Required</CardTitle>
            <CardDescription className="text-base">
              Price alerts are a members-only feature. Get a ZilStream membership
              to receive browser notifications when tokens hit your target prices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-left">
              <p className="text-sm font-medium mb-2">
                With price alerts you can:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set alerts when tokens go above or below a price</li>
                <li>• Get notified on significant percentage changes</li>
                <li>• Receive browser notifications even when in other tabs</li>
                <li>• Track multiple tokens simultaneously</li>
              </ul>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link href="/membership">Get Membership</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AlertsContent />;
}

function AlertsContent() {
  const {
    activeAlerts,
    triggeredAlerts,
    removeAlert,
    clearTriggered,
    notificationPermission,
    requestNotificationPermission,
    isNotificationSupported,
  } = usePriceAlertsContext();

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
  };

  return (
    <main className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Price Alerts</h1>
          <p className="text-muted-foreground">
            Get notified when tokens reach your target prices
          </p>
        </div>
      </div>

      {isNotificationSupported && notificationPermission !== "granted" && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Enable Browser Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {notificationPermission === "denied"
                    ? "Notifications are blocked. Enable them in your browser settings."
                    : "Allow notifications to receive price alerts."}
                </p>
              </div>
            </div>
            {notificationPermission === "default" && (
              <Button onClick={handleEnableNotifications} variant="outline">
                Enable
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>
            {activeAlerts.length === 0
              ? "No active alerts. Create one from any token page."
              : `${activeAlerts.length} active alert${activeAlerts.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        {activeAlerts.length > 0 && (
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="px-6">Token</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="px-6">
                      <Link
                        href={`/tokens/${alert.tokenAddress}`}
                        className="flex items-center gap-3 transition hover:opacity-80"
                      >
                        <TokenIcon
                          address={alert.tokenAddress}
                          alt={alert.tokenSymbol}
                          size={32}
                        />
                        <span className="font-medium">{alert.tokenSymbol}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatAlertDescription(alert)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAlert(alert.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {triggeredAlerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Triggered Alerts</CardTitle>
              <CardDescription>
                Alerts that have already been triggered
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearTriggered}>
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="px-6">Token</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Triggered</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {triggeredAlerts.map((alert) => (
                  <TableRow key={alert.id} className="opacity-60">
                    <TableCell className="px-6">
                      <Link
                        href={`/tokens/${alert.tokenAddress}`}
                        className="flex items-center gap-3 transition hover:opacity-80"
                      >
                        <TokenIcon
                          address={alert.tokenAddress}
                          alt={alert.tokenSymbol}
                          size={32}
                        />
                        <span className="font-medium">{alert.tokenSymbol}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatAlertDescription(alert)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {alert.triggeredAt
                        ? new Date(alert.triggeredAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAlert(alert.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeAlerts.length === 0 && triggeredAlerts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Alerts Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Visit any token page and click the bell icon to create your first
              price alert.
            </p>
            <Button asChild className="mt-4">
              <Link href="/tokens">Browse Tokens</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
