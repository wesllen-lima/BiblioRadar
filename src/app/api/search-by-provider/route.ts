import { NextRequest, NextResponse } from "next/server";
import { gutenberg } from "@/lib/providers/gutenberg";
import { internetArchive } from "@/lib/providers/internetArchive";
import { openLibrary } from "@/lib/providers/openLibrary";
import { makeOpdsProvider } from "@/lib/providers/opds";
import type { BookResult } from "@/lib/types";

export const runtime = "nodejs";

async function withTimeout<T>(p: Promise<T>, ms = 4500): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const provider = req.nextUrl.searchParams.get("provider") || "";
  const feed = req.nextUrl.searchParams.get("feed") || "";
  if (!q || !provider) return NextResponse.json({ results: [] as BookResult[] });

  try {
    let results: BookResult[] = [];

    if (provider === "gutenberg") {
      results = await safe(withTimeout(gutenberg.search(q)), []);
    } else if (provider === "internet_archive") {
      results = await safe(withTimeout(internetArchive.search(q)), []);
    } else if (provider === "open_library") {
      results = await safe(withTimeout(openLibrary.search(q)), []);
    } else if (provider === "opds" && feed) {
      results = await safe(withTimeout(makeOpdsProvider(feed).search(q)), []);
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] as BookResult[] }, { status: 500 });
  }
}
