import type { BookResult } from "./types";

const norm = (s:string) => s.toLowerCase().replace(/\s+/g," ").trim();

export function mergeClient(results: BookResult[]): BookResult[] {
  const map = new Map<string, BookResult>();
  for (const r of results) {
    const key = `${norm(r.title)}::${norm(r.authors[0] ?? "")}`;
    const ex = map.get(key);
    if (!ex) map.set(key, r);
    else {
      const pick = ex.pdfUrl && !r.pdfUrl ? ex : r.pdfUrl && !ex.pdfUrl ? r : ex;
      map.set(key, pick);
    }
  }
  return Array.from(map.values()).sort((a,b) => Number(!!b.pdfUrl) - Number(!!a.pdfUrl));
}
