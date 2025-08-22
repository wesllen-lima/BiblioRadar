export const runtime = "nodejs";

import { NextRequest } from "next/server";
import * as cheerio from "cheerio";

type ScrapeConfig = {
  type: "scrape";
  name: string;
  searchUrlTemplate: string;
  itemSelector: string;
  titleSelector?: string;
  linkSelector: string;
  authorSelector?: string;
  coverSelector?: string;
};

type ScrapedItem = {
  id: string;
  source: "scrape";
  title: string;
  authors: string[];
  cover?: string;
  pdfUrl?: string;
  readUrl?: string;
};

function absoluteUrl(base: string, href?: string | null) {
  if (!href) return undefined;
  try {
    return new URL(href, base).toString();
  } catch {
    return undefined;
  }
}

function buildSearchUrl(tpl: string, q: string) {
  return tpl.replace(/\{query\}/g, encodeURIComponent(q));
}

export async function POST(req: NextRequest) {
  let body: { q: string; config: ScrapeConfig };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const q = typeof body?.q === "string" ? body.q : "";
  const config = body?.config as ScrapeConfig | undefined;

  if (!q || !config || config.type !== "scrape") {
    return new Response("Missing q/config", { status: 400 });
  }

  const url = buildSearchUrl(config.searchUrlTemplate, q);

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; PDFBooksFinder/1.0)" },
      signal: controller.signal,
    });
    clearTimeout(to);

    if (!res.ok) {
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const items: ScrapedItem[] = [];
    const $items = $(config.itemSelector);

    const candidates =
      $items.length > 0 ? $items.toArray() : $("a[href$='.pdf']").toArray();

    for (const el of candidates) {
      const $el = $(el);

      const title =
        (config.titleSelector
          ? $el.find(config.titleSelector).first().text().trim()
          : ($el.attr("title") || $el.text() || "").trim()) || "Sem título";

      const href =
        (config.linkSelector
          ? $el.find(config.linkSelector).first().attr("href")
          : $el.is("a")
          ? $el.attr("href")
          : undefined) || undefined;

      const base = url;
      const fullHref = absoluteUrl(base, href);

      const isPdf = !!fullHref && /\.pdf(\?|#|$)/i.test(fullHref);

      const author = config.authorSelector
        ? $el.find(config.authorSelector).first().text().trim()
        : "";

      const cover = config.coverSelector
        ? absoluteUrl(
            base,
            $el.find(config.coverSelector).first().attr("src") || undefined
          )
        : undefined;

      items.push({
        id: `scrape:${config.name}:${fullHref || title}:${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        source: "scrape",
        title,
        authors: author ? [author] : [],
        cover,
        pdfUrl: isPdf ? fullHref : undefined,
        readUrl: isPdf ? fullHref : fullHref,
      });

      if (items.length >= 50) break;
    }

    return new Response(JSON.stringify({ results: items }), {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  }
}
