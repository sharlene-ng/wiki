"use client";

import { useState, useMemo } from "react";
import { pages } from "@/data";
import { searchEntries, SearchResult } from "@/lib/search";

export function useSearch() {
  const [query, setQuery] = useState("");

  const results: SearchResult[] = useMemo(
    () => searchEntries(pages, query),
    [query]
  );

  return {
    query,
    setQuery,
    results,
    isSearching: query.trim().length > 0,
  };
}
