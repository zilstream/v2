"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import type { SortOrder } from "@/hooks/use-table-params";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  column: string;
  label: string;
  currentSort: string;
  currentOrder: SortOrder;
  onSort: (column: string) => void;
  align?: "left" | "right";
  className?: string;
}

export function SortableHeader({
  column,
  label,
  currentSort,
  currentOrder,
  onSort,
  align = "right",
  className,
}: SortableHeaderProps) {
  const active = currentSort === column;
  const Icon = !active
    ? ArrowUpDown
    : currentOrder === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <TableHead
      className={cn(align === "right" ? "text-right" : "text-left", className)}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(column)}
        className={cn(
          "-mx-2 h-8 gap-1.5 font-medium",
          align === "right" && "ml-auto",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon
          className={cn("size-3.5", active ? "opacity-100" : "opacity-50")}
        />
      </Button>
    </TableHead>
  );
}
