export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSafeUrl } from "@/lib/security";

const schema = z.object({
  u: z.string().url(),
});

type HeadInfo = {
  ok: boolean;
  status: number;
  contentType?: string;
  contentLength?: number;
  finalUrl?: string;
};

async function doHead(u: string, signal: AbortSignal): Promise<HeadInfo> {
  // Timeout interno para o fetch não ficar pendurado
  const res = await fetch(u, { 
    method: "HEAD", 
    redirect: "follow", 
    signal,
    headers: {
      "User-Agent": "BiblioRadar/1.0 (HeadCheck)"
    }
  });
  
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
  const { searchParams } = req.nextUrl;
  const u = searchParams.get("u");

  const parsed = schema.safeParse({ u: u || "" });

  if (!parsed.success) {
    return NextResponse.json<HeadInfo>({ ok: false, status: 400 });
  }

  const targetUrl = parsed.data.u;

  // SEGURANÇA: Bloqueia acesso a localhost/rede interna
  if (!isSafeUrl(targetUrl)) {
    return NextResponse.json<HeadInfo>({ ok: false, status: 403 });
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000); // 5s total

  try {
    const info = await doHead(targetUrl, controller.signal);
    clearTimeout(t);
    return NextResponse.json(info);
  } catch {
    clearTimeout(t);
    // Retorna status 0 ou 408 em caso de erro/timeout
    return NextResponse.json<HeadInfo>({ ok: false, status: 0 });
  }
}