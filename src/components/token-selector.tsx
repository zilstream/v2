"use client";

import { Search } from "lucide-react";
import * as React from "react";

import { TokenIcon } from "@/components/token-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Token } from "@/lib/zilstream";
import { cn } from "@/lib/utils";

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken?: Token;
  onSelect: (token: Token) => void;
  trigger?: React.ReactNode;
}

const WZIL_ADDRESS = "0x94e18aE7dd5eE57B55f30c4B63E2760c09EFb192";

export function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  trigger,
}: TokenSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredTokens = React.useMemo(() => {
    if (!search) return tokens;
    const lowerSearch = search.toLowerCase();
    return tokens.filter((t) => {
      const symbol =
        t.address.toLowerCase() === WZIL_ADDRESS.toLowerCase()
          ? "ZIL"
          : t.symbol;
      return (
        symbol?.toLowerCase().includes(lowerSearch) ||
        t.name?.toLowerCase().includes(lowerSearch) ||
        t.address.toLowerCase() === lowerSearch
      );
    });
  }, [tokens, search]);

  const getTokenSymbol = (token: Token) => {
    if (token.address.toLowerCase() === WZIL_ADDRESS.toLowerCase())
      return "ZIL";
    return token.symbol;
  };

  const getTokenIcon = (token: Token) => {
    // TokenIcon component likely handles WZIL address correctly or we can force it if needed,
    // but usually WZIL address icon is ZIL icon.
    return token.address;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            {selectedToken ? (
              <>
                <TokenIcon
                  address={selectedToken.address}
                  alt={getTokenSymbol(selectedToken) || "Token"}
                  size={20}
                />
                <span>{getTokenSymbol(selectedToken)}</span>
              </>
            ) : (
              "Select Token"
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md gap-0 p-0 outline-none">
        <DialogHeader className="px-4 py-4 border-b">
          <DialogTitle>Select a Token</DialogTitle>
        </DialogHeader>
        <div className="p-4 pb-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or paste address"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
          <div className="grid gap-1">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted transition-colors",
                  selectedToken?.address === token.address && "bg-muted",
                )}
                onClick={() => {
                  onSelect(token);
                  setOpen(false);
                }}
              >
                <TokenIcon
                  address={token.address}
                  alt={getTokenSymbol(token) || "Token"}
                  size={32}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{getTokenSymbol(token)}</span>
                  <span className="text-xs text-muted-foreground">
                    {token.name}
                  </span>
                </div>
                {selectedToken?.address === token.address && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
            {filteredTokens.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No tokens found.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
