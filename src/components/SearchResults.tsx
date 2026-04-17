"use client";

import Link from "next/link";
import { SearchResult } from "@/lib/search";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Draft: "bg-yellow-100 text-yellow-700",
  Inactive: "bg-gray-100 text-gray-500",
  Lark: "bg-purple-100 text-purple-700",
};

export function SearchResults({
  results,
  onSelect,
}: {
  results: SearchResult[];
  onSelect: () => void;
}) {
  if (results.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">
        No results found
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <p className="text-xs text-gray-400 px-2 mb-2">
        {results.length} result{results.length !== 1 ? "s" : ""}
      </p>
      <ul className="space-y-1">
        {results.map((r) => (
          <li key={r.entry.id}>
            <Link
              href={`/${r.pageId}#${r.entry.id}`}
              onClick={onSelect}
              className="block px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {r.entry.item}
                </span>
                {r.entry.status && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                      statusColors[r.entry.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.entry.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {r.pageName} &rsaquo; {r.sectionName}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
