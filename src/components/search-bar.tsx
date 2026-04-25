import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchValue = query.trim();

    if (searchValue.startsWith("0x")) {
      if (searchValue.length === 66) {
        navigate({ to: "/tx/$hash", params: { hash: searchValue } });
      } else if (searchValue.length === 42) {
        navigate({ to: "/address/$address", params: { address: searchValue } });
      }
    } else if (/^\d+$/.test(searchValue)) {
      navigate({ to: "/block/$number", params: { number: searchValue } });
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
