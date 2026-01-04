export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { gutenberg } from "@/lib/providers/gutenberg";
import { internetArchive } from "@/lib/providers/internetArchive";
import { openLibrary } from "@/lib/providers/openLibrary";
import { mergeAndDedupe } from "@/lib/aggregate";
import type { BookResult } from "@/lib/types";

export const revalidate = 3600; 

async function searchSafe(name: string, p: Promise<BookResult[]>) {
  try {
    return await Promise.race([
      p,
      new Promise<BookResult[]>((_, rej) => setTimeout(() => rej(new Error("Timeout")), 5000))
    ]);
  } catch (e) {
    console.warn(`Provider ${name} failed:`, e);
    return [];
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const onlyPdf = req.nextUrl.searchParams.get("onlyPdf") === "1";
  
  if (!q) return NextResponse.json({ results: [], providers: [] });

  const results = await Promise.allSettled([
    searchSafe("gutenberg", gutenberg.search(q)),
    searchSafe("archive", internetArchive.search(q)),
    searchSafe("openlibrary", openLibrary.search(q)),
  ]);

  const flatResults = results
    .filter((r): r is PromiseFulfilledResult<BookResult[]> => r.status === "fulfilled")
    .flatMap(r => r.value);

  let merged = mergeAndDedupe(flatResults);
  
  if (onlyPdf) {
    merged = merged.filter(r => !!r.pdfUrl);
  }

  return NextResponse.json(
    { 
      results: merged, 
      providers: ["gutenberg", "internet_archive", "open_library"] 
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600"
      }
    }
  );
}