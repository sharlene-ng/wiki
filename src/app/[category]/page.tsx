import { notFound } from "next/navigation";
import { pages } from "@/data";
import { EntryCard } from "@/components/EntryCard";

export function generateStaticParams() {
  return pages.map((page) => ({ category: page.id }));
}

export function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  return params.then(({ category }) => {
    const page = pages.find((p) => p.id === category);
    return {
      title: page ? `${page.name} — Sharlene's Wiki` : "Not Found",
    };
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const page = pages.find((p) => p.id === category);

  if (!page) notFound();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{page.icon}</span>
          <h1 className="text-2xl font-bold text-gray-900">{page.name}</h1>
        </div>
        <p className="text-gray-500 text-sm">{page.description}</p>
      </div>

      <div className="space-y-10">
        {page.sections.map((section) => (
          <div key={section.id}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {section.name}
            </h2>
            <div className="space-y-3">
              {section.entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
