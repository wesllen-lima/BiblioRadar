"use client";
import { useEffect, useState } from "react";
import type { BookResult } from "@/lib/types";
import Image from "next/image";
import { useLibrary } from "@/lib/useLibrary";
import CitationModal from "./CitationModal";
import { Download, Heart, Quote, BookOpen, ShieldAlert, Globe } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "./I18nProvider";

type HeadInfo = {
  ok: boolean;
  status: number;
  contentType?: string;
};

export default function BookCard({ book }: { book: BookResult }) {
  const { t } = useI18n();
  const { isSaved, toggleBook } = useLibrary();
  const [showCitation, setShowCitation] = useState(false);
  const saved = isSaved(book.id);

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
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const r = await fetch(`/api/head?${new URLSearchParams({ u: book.pdfUrl })}`, { signal: controller.signal });
        clearTimeout(id);
        const info = (await r.json()) as HeadInfo;
        const looksPdf = !!info.contentType && /pdf/i.test(info.contentType);
        const okish = info.ok || looksPdf || info.status === 405;
        if (!cancelled) setPdfOk(okish ? (looksPdf ? true : null) : false);
      } catch {
        if (!cancelled) setPdfOk(null);
      }
    })();
    return () => { cancelled = true; };
  }, [book.pdfUrl]);

  const handleToggle = () => {
    toggleBook(book);
    toast.success(saved ? t("library.removed") : t("library.saved"), { 
      icon: saved ? "🗑️" : "❤️" 
    });
  };

  const proxyHref = book.pdfUrl
    ? `/api/download?url=${encodeURIComponent(book.pdfUrl)}`
    : undefined;

  const sourceLabel = (book.source || "").replace(/_/g, " ");
  const canShowPdf = Boolean(book.pdfUrl && pdfOk !== false);

  // Link para leitura/fonte: Se tiver readUrl, usa. Se não, tenta o ID se parecer uma URL (comum em scrapers)
  const sourceUrl = book.readUrl || (book.id.startsWith("http") ? book.id : null);

  const getSourceColor = (src: string) => {
    if (src.includes("gutenberg")) return "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
    if (src.includes("archive")) return "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";
    return "text-muted-foreground bg-muted border-border";
  };

  return (
    <>
      <article className="card group relative flex h-full flex-col overflow-hidden p-4 transition-all hover:border-primary/40 bg-card hover:shadow-md">
        <div className="flex gap-4 sm:gap-5 h-full">
          {/* Capa */}
          <div className="relative h-[130px] w-[90px] shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted shadow-sm group-hover:shadow-md transition-all">
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/40 bg-muted/30">
                <BookOpen size={32} strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors" title={book.title}>
                  {book.title || tt("book.untitled", "Sem título")}
                </h3>
              </div>

              <p className="mt-1.5 line-clamp-1 text-sm font-medium text-muted-foreground">
                {book.authors?.length ? book.authors.join(", ") : tt("book.unknownAuthor", "Autor desconhecido")}
              </p>
              
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                 {sourceLabel && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSourceColor(book.source || "")}`}>
                    {sourceLabel}
                  </span>
                )}
                 {book.year && (
                   <span className="text-xs text-muted-foreground/60 font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                    {book.year}
                  </span>
                 )}
              </div>
            </div>

            {/* Barra de Ações */}
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border/40 pt-3">
              
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Botão PDF */}
                {canShowPdf && book.pdfUrl && (
                  <div className="flex items-center gap-1">
                    <a
                      href={book.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="btn-danger h-8 px-3 gap-1.5 shadow-sm"
                      title={tt("book.download", "Baixar PDF")}
                    >
                      <Download size={14} strokeWidth={2.5} />
                      <span className="hidden sm:inline">PDF</span>
                    </a>
                    
                    {proxyHref && (
                      <a
                        href={proxyHref}
                        className="btn-icon h-8 w-8 text-warning border border-warning/20 bg-warning/5 hover:bg-warning/10"
                        title={tt("book.serverTooltip", "Proxy Seguro")}
                      >
                        <ShieldAlert size={14} />
                      </a>
                    )}
                  </div>
                )}

                {/* Botão Ver Fonte (Sempre visível se houver URL) */}
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline h-8 px-3 gap-1.5 shadow-sm text-xs"
                    title="Abrir no site original"
                  >
                    <Globe size={13} />
                    <span className="hidden sm:inline">{tt("book.source", "Ver Fonte")}</span>
                    <span className="sm:hidden">Web</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowCitation(true)}
                  className="btn-icon h-8 w-8 hover:text-primary hover:bg-primary/10"
                  title={tt("citation.title", "Citar")}
                >
                  <Quote size={16} />
                </button>
                
                <button
                  onClick={handleToggle}
                  className={`btn-icon h-8 w-8 transition-all ${
                    saved 
                      ? "text-red-500 bg-red-50 hover:bg-red-100 border border-red-100" 
                      : "hover:text-red-500 hover:bg-red-50"
                  }`}
                  title={saved ? t("common.remove") : t("library.saved")}
                >
                  <Heart size={16} fill={saved ? "currentColor" : "none"} strokeWidth={saved ? 0 : 2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {showCitation && <CitationModal book={book} onClose={() => setShowCitation(false)} />}
    </>
  );
}