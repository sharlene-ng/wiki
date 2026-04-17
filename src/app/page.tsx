import Link from "next/link";
import { pages } from "@/data";

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {process.env.NEXT_PUBLIC_APP_TITLE || "Sharlene's Wiki"}
        </h1>
        <p className="text-gray-500 mt-1">
          {process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Personal knowledge base"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => {
          const entryCount = page.sections.reduce(
            (sum, s) => sum + s.entries.length,
            0
          );
          return (
            <Link
              key={page.id}
              href={`/${page.id}`}
              className="group block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{page.icon}</span>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {page.name}
                </h2>
              </div>
              <p className="text-sm text-gray-500">{page.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>{page.sections.length} sections</span>
                <span>{entryCount} entries</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
