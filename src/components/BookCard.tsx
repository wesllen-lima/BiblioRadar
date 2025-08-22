"use client";
import { useEffect, useState } from "react";
import type { BookResult } from "@/lib/types";
import { useI18n } from "@/components/I18nProvider";
import Image from "next/image";

type HeadInfo = {
  ok: boolean;
  status: number;
  contentType?: string;
  contentLength?: number;
  finalUrl?: string;
};

export default function BookCard({ book }: { book: BookResult }) {
  const { t } = useI18n();
  const tt = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const [pdfOk, setPdfOk] = useState<boolean | null>(book.pdfUrl ? null : false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!book.pdfUrl) return;
      try {
        const r = await fetch(`/api/head?${new URLSearchParams({ u: book.pdfUrl })}`);
        const info = (await r.json()) as HeadInfo;
        const looksPdf = !!info.contentType && /pdf/i.test(info.contentType);
        const okish = info.ok || looksPdf || info.status === 405;
        if (!cancelled) setPdfOk(okish ? (looksPdf ? true : null) : false);
      } catch {
        if (!cancelled) setPdfOk(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [book.pdfUrl]);

  const proxyHref = book.pdfUrl
    ? `/api/download?url=${encodeURIComponent(book.pdfUrl)}`
    : undefined;

  const sourceLabel = (book.source || "").replace(/_/g, " ");
  const canShowPdf = Boolean(book.pdfUrl && pdfOk !== false);

  return (
    <article className="card grid grid-cols-[84px_1fr] gap-3 p-3 md:p-4 animate-rise">
      <div className="shrink-0">
        <div className="w-[84px] h-[112px] rounded-md border border-soft overflow-hidden bg-surface">
          {book.cover ? (
            <Image
              src={book.cover}
              alt=""
              width={84}
              height={112}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-shimmer" aria-hidden />
          )}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="m-0 text-[15px] md:text-[16px] font-semibold leading-snug truncate">
            {book.title || tt("book.untitled", "Sem título")}
          </h3>
          {sourceLabel ? <span className="chip capitalize">{sourceLabel}</span> : null}
        </div>

        <p className="mt-1 mb-2 text-sm text-muted leading-snug truncate">
          {book.authors?.length ? book.authors.join(", ") : tt("book.unknownAuthor", "Autor desconhecido")}
          {book.year ? ` • ${book.year}` : ""}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {canShowPdf && book.pdfUrl ? (
            <>
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="btn-primary btn-sm"
                aria-label={tt("book.download", "Baixar PDF")}
                title={pdfOk === null ? tt("book.notVerified", "Não verificado (alguns hosts bloqueiam HEAD)") : tt("book.direct", "Baixar diretamente da fonte")}
              >
                {tt("book.download", "Baixar PDF")}
              </a>
              {proxyHref ? (
                <a
                  href={proxyHref}
                  className="btn-ghost btn-sm"
                  aria-label={tt("book.server", "Via servidor")}
                  title={tt("book.serverTooltip", "Baixar via servidor (evita CORS)")}
                >
                  {tt("book.server", "Via servidor")}
                </a>
              ) : null}
            </>
          ) : null}

          {(!book.pdfUrl || pdfOk === false) && book.readUrl ? (
            <a
              href={book.readUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-sm"
              aria-label={tt("book.read", "Ler online")}
            >
              {tt("book.read", "Ler online")}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
