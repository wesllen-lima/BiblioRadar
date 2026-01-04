"use client";
import { useState, useEffect } from "react";
import type { BookResult } from "@/lib/types";
import { useI18n } from "./I18nProvider";
import { Copy, Check, X, Quote } from "lucide-react";

export default function CitationModal({
  book,
  onClose,
}: {
  book: BookResult;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const tt = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const today = new Date().toLocaleDateString("pt-BR");
  
  const rawAuthor = book.authors[0] || "AUTOR DESCONHECIDO";
  const parts = rawAuthor.split(" ");
  const lastName = parts.length > 1 ? parts.pop()?.toUpperCase() : rawAuthor.toUpperCase();
  const firstName = parts.length > 1 ? parts.join(" ") : "";
  const abntAuthor = parts.length > 1 ? `${lastName}, ${firstName}` : rawAuthor.toUpperCase();

  const title = book.title;
  const year = book.year || "s.d.";
  const url = book.readUrl || book.pdfUrl || currentUrl;

  const formats = [
    {
      id: "abnt",
      label: "ABNT (Brasil)",
      text: `${abntAuthor}. ${title}. ${year}. Disponível em: <${url}>. Acesso em: ${today}.`,
    },
    {
      id: "apa",
      label: "APA (Internacional)",
      text: `${rawAuthor} (${year}). ${title}. Retrieved from ${url}`,
    },
    {
      id: "bibtex",
      label: "BibTeX (LaTeX)",
      text: `@misc{${book.id.replace(/[^a-z0-9]/gi, "")},
  author = {${rawAuthor}},
  title = {${title}},
  year = {${year}},
  url = {${url}}
}`,
    },
  ];

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch {}
  };

  const animationClass = mounted ? "opacity-100 scale-100" : "opacity-0 scale-95";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-200" 
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl transition-all duration-300 ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Quote size={16} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">{tt("citation.title", "Citar Obra")}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4">
          {formats.map((f) => (
            <div key={f.id} className="group">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{f.label}</span>
                {copied === f.id && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 animate-pulse">
                    <Check size={12} /> {t("citation.copied")}
                  </span>
                )}
              </div>
              
              <button
                className={`
                  relative w-full text-left p-3.5 rounded-lg border text-xs font-mono leading-relaxed break-words transition-all duration-200
                  ${copied === f.id 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-100" 
                    : "bg-muted/30 border-border text-foreground hover:border-primary/40 hover:bg-background hover:shadow-sm"
                  }
                `}
                onClick={() => copy(f.text, f.id)}
                title={t("citation.copy")}
              >
                {f.text}
                <div className="absolute top-3 right-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {copied === f.id ? <Check size={14} /> : <Copy size={14} />}
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button onClick={onClose} className="btn-ghost btn-sm">
            {tt("action.close", "Fechar")}
          </button>
        </div>
      </div>
    </div>
  );
}