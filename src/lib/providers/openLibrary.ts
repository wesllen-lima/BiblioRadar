import type { Provider } from "./base";

type OLDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

type OLResponse = {
  docs?: OLDoc[];
};

export const openLibrary: Provider = {
  id: "open_library",
  label: "Open Library",
  async search(q: string) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=25`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as OLResponse;
    const works: OLDoc[] = data?.docs ?? [];

    return works.map((w) => ({
      id: `ol:${w.key || w.title || ""}`,
      source: "open_library",
      title: w.title ?? "",
      authors: Array.isArray(w.author_name) ? w.author_name : [],
      year: w.first_publish_year !== undefined ? Number(w.first_publish_year) : undefined,
      cover: w.cover_i ? `https://covers.openlibrary.org/b/id/${w.cover_i}-M.jpg` : undefined,
      pdfUrl: undefined,
      readUrl: w.key ? `https://openlibrary.org${w.key}` : undefined,
    }));
  },
};
