"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchValue = query.trim();

    if (searchValue.startsWith("0x")) {
      if (searchValue.length === 66) {
        router.push(`/tx/${searchValue}`);
      } else if (searchValue.length === 42) {
        router.push(`/address/${searchValue}`);
      }
    } else if (/^\d+$/.test(searchValue)) {
      router.push(`/block/${searchValue}`);
    }

    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search addresses, blocks, transactions..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
    </form>
  );
}
