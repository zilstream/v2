"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { getTokenIconUrl } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface TokenIconProps {
  address?: string;
  alt: string;
  size?: number;
  className?: string;
}

export function TokenIcon({
  address,
  alt,
  size = 32,
  className,
}: TokenIconProps) {
  const [hasError, setHasError] = useState(false);
  const src = !hasError ? getTokenIconUrl(address) : undefined;
  const initials = useMemo(() => getInitials(alt), [alt]);

  if (!src) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "rounded-full border border-border/70 object-cover",
        className,
      )}
      style={{ width: size, height: size }}
      onError={() => setHasError(true)}
    />
  );
}

function getInitials(value: string) {
  if (!value) return "?";
  const trimmed = value.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}
