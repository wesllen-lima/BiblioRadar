import type { Provider } from "./base";

type IADoc = {
  identifier: string;
  title?: string;
  creator?: string | string[];
  year?: string | number;
  mediatype?: string;
};

type IAResponse = {
  response?: {
    docs?: IADoc[];
  };
};

export const internetArchive: Provider = {
  id: "internet_archive",
  label: "Internet Archive",
  async search(q: string) {
    const fields = ["identifier", "title", "creator", "year", "mediatype"].join(",");
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
      `${q} AND mediatype:texts`
    )}&fl[]=${fields}&rows=25&page=1&output=json`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as IAResponse;
    const docs: IADoc[] = data.response?.docs ?? [];

    return docs.map((d) => {
      const id = d.identifier;
      const creators = d.creator;
      const authors = Array.isArray(creators) ? creators : creators ? [creators] : [];
      return {
        id: `ia:${id}`,
        source: "internet_archive",
        title: d.title ?? "",
        authors,
        year: d.year !== undefined ? Number(d.year) : undefined,
        cover: `https://archive.org/services/img/${id}`,
        pdfUrl: `https://archive.org/download/${id}/${id}.pdf`,
        readUrl: `https://archive.org/details/${id}`,
      };
    });
  },
};
