import { WikiEntry, WikiPage } from "@/data";

export interface SearchResult {
  entry: WikiEntry;
  sectionName: string;
  pageName: string;
  pageId: string;
}

export function searchEntries(pages: WikiPage[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const results: SearchResult[] = [];

  for (const page of pages) {
    for (const section of page.sections) {
      for (const entry of section.entries) {
        const searchable = [
          entry.item,
          entry.status,
          entry.url ?? "",
          entry.attachment ?? "",
          ...entry.tags,
        ]
          .join(" ")
          .toLowerCase();

        if (searchable.includes(q)) {
          results.push({
            entry,
            sectionName: section.name,
            pageName: page.name,
            pageId: page.id,
          });
        }
      }
    }
  }

  return results;
}
