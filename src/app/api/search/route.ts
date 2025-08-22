import { NextRequest, NextResponse } from "next/server";
import { gutenberg } from "@/lib/providers/gutenberg";
import { internetArchive } from "@/lib/providers/internetArchive";
import { openLibrary } from "@/lib/providers/openLibrary";
import { mergeAndDedupe } from "@/lib/aggregate";

export const runtime = "nodejs";

async function withTimeout<T>(p: Promise<T>, ms = 4500): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const onlyPdf = req.nextUrl.searchParams.get("onlyPdf") === "1";
  if (!q) return NextResponse.json({ results: [], providers: [] });

  try {
    const tasks = [
      withTimeout(gutenberg.search(q)).catch(() => []),
      withTimeout(internetArchive.search(q)).catch(() => []),
      withTimeout(openLibrary.search(q)).catch(() => []),
    ];
    const batches = await Promise.all(tasks);
    let results = mergeAndDedupe(batches.flat());
    if (onlyPdf) results = results.filter(r => !!r.pdfUrl);

    return NextResponse.json({
      results,
      providers: ["gutenberg", "internet_archive", "open_library"],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ results: [], providers: [] }, { status: 500 });
  }
}
