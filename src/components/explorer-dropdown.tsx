"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExplorerDropdownProps {
  type: "block" | "tx" | "address";
  value: string | number;
}

const EXPLORERS = [
  { name: "OtterScan", baseUrl: "https://otterscan.zilliqa.com" },
  { name: "Blockscout", baseUrl: "https://zilliqa.blockscout.com" },
  { name: "EVMX", baseUrl: "https://evmx.zilliqa.com" },
];

export function ExplorerDropdown({ type, value }: ExplorerDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ExternalLink className="h-3.5 w-3.5" />
          View on
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {EXPLORERS.map((explorer) => (
          <DropdownMenuItem key={explorer.name} asChild>
            <a
              href={`${explorer.baseUrl}/${type}/${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {explorer.name}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
