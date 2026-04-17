"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pages } from "@/data";
import { useSearch } from "@/hooks/useSearch";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { query, setQuery, results, isSearching } = useSearch();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="block mb-4" onClick={onNavigate}>
          <h1 className="text-xl font-bold text-gray-900">
            {process.env.NEXT_PUBLIC_APP_TITLE || "Sharlene's Wiki"}
          </h1>
          <p className="text-xs text-gray-500">Personal Knowledge Base</p>
        </Link>
        <SearchBar query={query} onChange={setQuery} />
      </div>

      {isSearching ? (
        <SearchResults
          results={results}
          onSelect={() => {
            setQuery("");
            onNavigate?.();
          }}
        />
      ) : (
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {pages.map((page) => {
              const isActive = pathname === `/${page.id}`;
              return (
                <li key={page.id}>
                  <Link
                    href={`/${page.id}`}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-base">{page.icon}</span>
                    <span>{page.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
