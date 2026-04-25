import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function TableSearch({
  value,
  onChange,
  placeholder = "Search...",
  className,
  debounceMs = 300,
}: TableSearchProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const handle = setTimeout(() => onChange(local), debounceMs);
    return () => clearTimeout(handle);
  }, [local, value, onChange, debounceMs]);

  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={local}
        onChange={(event) => setLocal(event.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-8"
      />
      {local && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setLocal("")}
          className="absolute right-0.5 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
