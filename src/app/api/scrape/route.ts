export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { z } from "zod";
import { isSafeUrl } from "@/lib/security";

// Validação rigorosa da entrada
const schema = z.object({
  q: z.string().trim().min(1).max(200),
  config: z.object({
    type: z.literal("scrape"),
    name: z.string(),
    searchUrlTemplate: z.string().url(),
    itemSelector: z.string().min(1),
    titleSelector: z.string().optional(),
    linkSelector: z.string().min(1),
    authorSelector: z.string().optional(),
    coverSelector: z.string().optional(),
  }),
});

function absoluteUrl(base: string, href?: string | null) {
  if (!href) return undefined;
  try { return new URL(href, base).toString(); } catch { return undefined; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ results: [] }, { status: 400 });
    }

    const { q, config } = parsed.data;
    const targetUrl = config.searchUrlTemplate.replace(/\{query\}/g, encodeURIComponent(q));

    // PROTEÇÃO SSRF: Verifica se a URL gerada é segura antes de acessar
    if (!isSafeUrl(targetUrl)) {
      console.warn(`Blocked unsafe URL attempt: ${targetUrl}`);
      return NextResponse.json({ results: [] }, { status: 403 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BiblioRadar/1.0)" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Status ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: any[] = [];
    const $items = $(config.itemSelector);
    
    // Fallback inteligente se o seletor principal falhar
    const candidates = $items.length > 0 ? $items : $("a[href$='.pdf']").parent();

    candidates.slice(0, 40).each((_, el) => {
      const $el = $(el);
      
      const rawLink = config.linkSelector 
        ? $el.find(config.linkSelector).first().attr("href") 
        : $el.is("a") ? $el.attr("href") : $el.find("a").first().attr("href");

      const fullHref = absoluteUrl(targetUrl, rawLink);
      if (!fullHref) return;

      const title = (config.titleSelector 
        ? $el.find(config.titleSelector).first().text() 
        : $el.attr("title") || $el.text()).trim() || "Sem título";

      const author = config.authorSelector 
        ? $el.find(config.authorSelector).first().text().trim() 
        : "";

      const coverSrc = config.coverSelector 
        ? $el.find(config.coverSelector).attr("src") 
        : undefined;

      const isPdf = /\.pdf(\?|#|$)/i.test(fullHref);

      items.push({
        id: `scrape:${config.name}:${Buffer.from(fullHref).toString('base64').slice(0,12)}`,
        source: "scrape",
        title,
        authors: author ? [author] : [],
        cover: absoluteUrl(targetUrl, coverSrc),
        pdfUrl: isPdf ? fullHref : undefined,
        readUrl: fullHref,
      });
    });

    return NextResponse.json({ results: items });

  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json({ results: [] }); // Retorna vazio gracefully
  }
}