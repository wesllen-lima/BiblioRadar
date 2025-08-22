export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

type HeadInfo = {
  ok: boolean;
  status: number;
  contentType?: string;
  contentLength?: number;
  finalUrl?: string;
};

async function doHead(u: string, signal: AbortSignal): Promise<HeadInfo> {
  const res = await fetch(u, { method: "HEAD", redirect: "follow", signal });
  const ct = res.headers.get("content-type") || undefined;
  const cl = res.headers.get("content-length");
  return {
    ok: res.ok,
    status: res.status,
    contentType: ct,
    contentLength: cl ? Number(cl) : undefined,
    finalUrl: res.url,
  };
}

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return NextResponse.json<HeadInfo>({ ok: false, status: 400 });
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 6000);
  try {
    const info = await doHead(u, controller.signal);
    clearTimeout(t);
    return NextResponse.json(info);
  } catch {
    clearTimeout(t);
    return NextResponse.json<HeadInfo>({ ok: false, status: 0 });
  }
}
