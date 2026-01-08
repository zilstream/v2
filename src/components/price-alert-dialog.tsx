"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TokenIcon } from "@/components/token-icon";
import { usePriceAlertsContext } from "@/components/price-alerts-provider";
import type {
  AlertCondition,
  AlertTimeframe,
  PercentageAlert,
  ThresholdAlert,
} from "@/lib/price-alerts";
import { formatPriceUsd } from "@/lib/format";

interface PriceAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: {
    address: string;
    symbol?: string;
    name?: string;
    priceUsd?: string;
  };
}

type AlertType = "threshold" | "percentage";

export function PriceAlertDialog({
  open,
  onOpenChange,
  token,
}: PriceAlertDialogProps) {
  const {
    addAlert,
    notificationPermission,
    requestNotificationPermission,
    isNotificationSupported,
  } = usePriceAlertsContext();

  const [alertType, setAlertType] = useState<AlertType>("threshold");
  const [condition, setCondition] = useState<AlertCondition>("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [percentageChange, setPercentageChange] = useState("");
  const [timeframe, setTimeframe] = useState<AlertTimeframe>("24h");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = token.priceUsd
    ? Number.parseFloat(token.priceUsd)
    : undefined;

  const handleSubmit = async () => {
    if (!isNotificationSupported) {
      toast.error("Browser notifications are not supported");
      return;
    }

    // Request permission if needed
    if (notificationPermission === "default") {
      const result = await requestNotificationPermission();
      if (result === "denied") {
        toast.error(
          "Notification permission denied. Enable notifications in your browser settings.",
        );
        return;
      }
    } else if (notificationPermission === "denied") {
      toast.error(
        "Notifications are blocked. Enable them in your browser settings.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (alertType === "threshold") {
        const price = Number.parseFloat(targetPrice);
        if (Number.isNaN(price) || price <= 0) {
          toast.error("Please enter a valid price");
          return;
        }

        addAlert({
          type: "threshold",
          tokenAddress: token.address,
          tokenSymbol: token.symbol ?? "Unknown",
          condition,
          targetPrice: price,
        } as Omit<ThresholdAlert, "id" | "createdAt" | "triggered" | "triggeredAt">);
      } else {
        const percentage = Number.parseFloat(percentageChange);
        if (Number.isNaN(percentage) || percentage <= 0) {
          toast.error("Please enter a valid percentage");
          return;
        }

        addAlert({
          type: "percentage",
          tokenAddress: token.address,
          tokenSymbol: token.symbol ?? "Unknown",
          percentageChange: percentage,
          timeframe,
        } as Omit<PercentageAlert, "id" | "createdAt" | "triggered" | "triggeredAt">);
      }

      toast.success("Price alert created");
      onOpenChange(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAlertType("threshold");
    setCondition("above");
    setTargetPrice("");
    setPercentageChange("");
    setTimeframe("24h");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TokenIcon
              address={token.address}
              alt={token.symbol ?? "Token"}
              size={24}
            />
            Create Price Alert
          </DialogTitle>
          <DialogDescription>
            Get notified when {token.symbol ?? "this token"} reaches your target
            price.
            {currentPrice !== undefined && (
              <span className="block mt-1">
                Current price: {formatPriceUsd(token.priceUsd!)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Alert Type</label>
            <Select
              value={alertType}
              onValueChange={(value: AlertType) => setAlertType(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="threshold">Price Threshold</SelectItem>
                <SelectItem value="percentage">Percentage Change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {alertType === "threshold" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select
                  value={condition}
                  onValueChange={(value: AlertCondition) => setCondition(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Price goes above</SelectItem>
                    <SelectItem value="below">Price goes below</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Percentage Change</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="5"
                    value={percentageChange}
                    onChange={(e) => setPercentageChange(e.target.value)}
                    className="pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alert when price changes by this percentage (up or down)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Timeframe</label>
                <Select
                  value={timeframe}
                  onValueChange={(value: AlertTimeframe) => setTimeframe(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Create Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
