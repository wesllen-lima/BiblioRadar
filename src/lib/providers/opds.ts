import type { Provider } from "./base";
import type { BookResult } from "../types";

export function makeOpdsProvider(feedUrl: string): Provider {
  const label = `OPDS: ${feedUrl}`;
  return {
    id: `opds:${feedUrl}`,
    label,
    async search(q: string): Promise<BookResult[]> {
      const url = feedUrl.includes("?")
        ? `${feedUrl}&search=${encodeURIComponent(q)}`
        : `${feedUrl}?search=${encodeURIComponent(q)}`;

      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) return [];
      const xml = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const entries = Array.from(doc.getElementsByTagName("entry"));

      const items: BookResult[] = [];
      for (const e of entries) {
        const title = e.getElementsByTagName("title")[0]?.textContent || "Sem título";
        const authors = Array.from(e.getElementsByTagName("author"))
          .map(a => a.getElementsByTagName("name")[0]?.textContent || "")
          .filter(Boolean);
        const links = Array.from(e.getElementsByTagName("link"));

        const pdfLink = links.find(l => l.getAttribute("type") === "application/pdf")?.getAttribute("href") || undefined;
        const cover = links.find(l => (l.getAttribute("rel") || "").includes("image"))?.getAttribute("href") || undefined;
        const altRead = links.find(l => (l.getAttribute("rel") || "").includes("alternate"))?.getAttribute("href") || undefined;

        items.push({
          id: `opds:${title}:${pdfLink || altRead || Math.random()}`,
          source: "opds",
          title,
          authors,
          cover,
          pdfUrl: pdfLink,
          readUrl: altRead || pdfLink,
        });
      }
      return items;
    },
  };
}
