"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { shortenAddress } from "@/lib/format";

interface CopyAddressProps {
  address: string;
  chars?: number;
}

export function CopyAddress({ address, chars = 4 }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-mono transition hover:bg-muted"
      type="button"
    >
      <span>{shortenAddress(address, chars)}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
