"use client";

import { WikiEntry } from "@/data";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Inactive: "bg-gray-100 text-gray-500 border-gray-200",
  Lark: "bg-purple-100 text-purple-700 border-purple-200",
};

const URL_REGEX = /(https?:\/\/[^\s,)]+)/g;

function renderWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-2 hover:text-blue-800 break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      {label}
    </a>
  );
}

export function EntryCard({ entry }: { entry: WikiEntry }) {
  return (
    <div
      id={entry.id}
      className="rounded-xl border border-gray-200 bg-white p-4 scroll-mt-24 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">{entry.item}</h3>
        {entry.status && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 border ${
              statusColors[entry.status] ?? "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {entry.status}
          </span>
        )}
      </div>

      {(entry.url || entry.attachment) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {entry.url && (
            <LinkButton
              href={entry.url}
              label={getDomainLabel(entry.url)}
            />
          )}
          {entry.attachment && entry.attachment.startsWith("http") && (
            <LinkButton
              href={entry.attachment}
              label="Attachment"
            />
          )}
          {entry.attachment && !entry.attachment.startsWith("http") && (
            <span className="inline-flex items-center px-2 py-1 text-[10px] font-medium text-gray-500 bg-gray-50 rounded-md border border-gray-100">
              {entry.attachment}
            </span>
          )}
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getDomainLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const labels: Record<string, string> = {
      "docs.google.com": "Google Docs",
      "drive.google.com": "Google Drive",
      "forms.gle": "Google Form",
      "photos.app.goo.gl": "Google Photos",
      "airtable.com": "Airtable",
      "trello.com": "Trello",
      "notion.so": "Notion",
      "freedombusiness.io": "Payment Link",
      "millionairemarketer.io": "MM Website",
      "onegoodurl.com": "Short Link",
      "autocrm.ai": "AutoCRM",
    };
    for (const [domain, label] of Object.entries(labels)) {
      if (hostname.includes(domain)) return label;
    }
    if (hostname.includes("larksuite.com")) return "Lark";
    if (hostname.includes("senangpay")) return "SenangPay";
    if (hostname.includes("billplz")) return "Billplz";
    if (hostname.includes("stripe")) return "Stripe";
    return "Open Link";
  } catch {
    return "Open Link";
  }
}
