import { NextRequest } from "next/server";

export const runtime = "nodejs";

const DEFAULT_HOSTS = new Set([
  "gutenberg.org",
  "www.gutenberg.org",
  "archive.org",
  "openlibrary.org",
  "covers.openlibrary.org",
]);

function makeTrustedHosts(): Set<string> {
  const extra = (process.env.TRUSTED_DOWNLOAD_HOSTS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_HOSTS, ...extra]);
}

const MAX_BYTES = Number(process.env.DOWNLOAD_MAX_BYTES || 50 * 1024 * 1024);

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) return new Response("Missing url", { status: 400 });

  let src: URL;
  try { src = new URL(urlParam); } catch { return new Response("Invalid url", { status: 400 }); }
  if (!/^https?:$/.test(src.protocol)) return new Response("Protocol not allowed", { status: 400 });

  const trusted = makeTrustedHosts();
  const h = src.hostname.toLowerCase();
  const okHost = [...trusted].some(host => h === host || h.endsWith(`.${host}`));
  if (!okHost) return new Response("Host not allowed", { status: 403 });

  try {
    const head = await fetch(src.toString(), { method: "HEAD" });
    if (head.ok) {
      const ct = (head.headers.get("content-type") || "").toLowerCase();
      if (!ct.includes("pdf")) return new Response("Not a PDF", { status: 415 });
      const lenStr = head.headers.get("content-length");
      if (lenStr) {
        const len = Number(lenStr);
        if (!Number.isNaN(len) && len > MAX_BYTES) return new Response("File too large", { status: 413 });
      }
    }
  } catch {
  }

  const resp = await fetch(src.toString());
  if (!resp.ok || !resp.body) return new Response("Failed to fetch source", { status: 502 });

  const ct = (resp.headers.get("content-type") || "application/pdf").toLowerCase();
  if (!ct.includes("pdf")) return new Response("Not a PDF", { status: 415 });

  const reader = resp.body.getReader();
  let bytes = 0;

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { controller.error(new Error("File too large")); return; }
      controller.enqueue(value);
    }
  });

  const filename = src.pathname.split("/").pop() || "download.pdf";

  return new Response(stream, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
