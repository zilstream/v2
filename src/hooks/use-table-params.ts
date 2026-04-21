"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SortOrder = "asc" | "desc";

export interface TableParamsDefaults {
  sortBy: string;
  sortOrder: SortOrder;
}

export interface TableParams {
  search: string;
  sortBy: string;
  sortOrder: SortOrder;
  page: number;
  setSearch: (value: string) => void;
  toggleSort: (column: string) => void;
  setPage: (page: number) => void;
}

export function useTableParams(defaults: TableParamsDefaults): TableParams {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("q") ?? "";
  const sortBy = searchParams.get("sort") ?? defaults.sortBy;
  const sortOrderParam = searchParams.get("order");
  const sortOrder: SortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : defaults.sortOrder;
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const setSearch = useCallback(
    (value: string) => {
      update({ q: value || null, page: null });
    },
    [update],
  );

  const toggleSort = useCallback(
    (column: string) => {
      const nextOrder: SortOrder =
        sortBy === column && sortOrder === "desc" ? "asc" : "desc";
      const isDefault =
        column === defaults.sortBy && nextOrder === defaults.sortOrder;
      update({
        sort: isDefault ? null : column,
        order: isDefault ? null : nextOrder,
        page: null,
      });
    },
    [defaults.sortBy, defaults.sortOrder, sortBy, sortOrder, update],
  );

  const setPage = useCallback(
    (next: number) => {
      update({ page: next > 1 ? String(next) : null });
    },
    [update],
  );

  return useMemo(
    () => ({
      search,
      sortBy,
      sortOrder,
      page,
      setSearch,
      toggleSort,
      setPage,
    }),
    [search, sortBy, sortOrder, page, setSearch, toggleSort, setPage],
  );
}
