export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { isSafeUrl } from "@/lib/security";

const DEFAULT_HOSTS = [
  "gutenberg.org", "archive.org", "openlibrary.org", "covers.openlibrary.org",
  "scielo.org", "scielo.br", "periodicos.capes.gov.br", "gov.br",
  "usp.br", "unicamp.br", "unesp.br",
  "arxiv.org", "biorxiv.org", "medrxiv.org", "ssrn.com", "core.ac.uk",
  "ncbi.nlm.nih.gov", "plos.org", "mdpi.com", "frontiersin.org",
  "springeropen.com", "hindawi.com", "researchgate.net", "academia.edu"
];

let trustedHostsCache: Set<string> | null = null;

function getTrustedHosts(): Set<string> {
  if (trustedHostsCache) return trustedHostsCache;
  
  const extra = (process.env.TRUSTED_DOWNLOAD_HOSTS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
    
  const allHosts = [...DEFAULT_HOSTS, ...extra].flatMap(h => [h, `www.${h}`]);
  trustedHostsCache = new Set(allHosts);
  return trustedHostsCache;
}

const MAX_BYTES = Number(process.env.DOWNLOAD_MAX_BYTES || 50 * 1024 * 1024);

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) return new Response("Missing url", { status: 400 });

  let src: URL;
  try { src = new URL(urlParam); } catch { return new Response("Invalid url", { status: 400 }); }

  if (!["http:", "https:"].includes(src.protocol)) return new Response("Protocol not allowed", { status: 400 });

  if (!isSafeUrl(src.toString())) return new Response("Unsafe destination", { status: 403 });

  const trusted = getTrustedHosts();
  const h = src.hostname.toLowerCase().replace(/^www\./, "");
  
  const isTrusted = [...trusted].some(trustedHost => {
    const cleanTrusted = trustedHost.replace(/^www\./, "");
    return h === cleanTrusted || h.endsWith(`.${cleanTrusted}`);
  });
  
  if (!isTrusted) return new Response("Host not allowed", { status: 403 });

  try {
    const head = await fetch(src.toString(), { 
      method: "HEAD",
      headers: { "User-Agent": "BiblioRadar/1.0" }
    });
    
    if (head.ok) {
      const lenStr = head.headers.get("content-length");
      if (lenStr) {
        const len = Number(lenStr);
        if (!Number.isNaN(len) && len > MAX_BYTES) return new Response("File too large", { status: 413 });
      }
    }

    const resp = await fetch(src.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BiblioRadar/1.0)" }
    });
    
    if (!resp.ok || !resp.body) return new Response("Upstream error", { status: 502 });

    const reader = resp.body.getReader();
    let bytes = 0;

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) { 
          controller.error(new Error("File limit exceeded")); 
          return; 
        }
        controller.enqueue(value);
      }
    });

    let filename = "document.pdf";
    const disp = resp.headers.get("content-disposition");
    if (disp && disp.includes("filename=")) {
      const match = disp.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    } else {
      filename = src.pathname.split("/").pop() || "document.pdf";
    }

    return new Response(stream, {
      headers: {
        "Content-Type": resp.headers.get("Content-Type") || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (err) {
    console.error("Download error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}