"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BookResult } from "@/lib/types";
import SkeletonCard from "@/components/SkeletonCard";
import ProvidersManager, { type CustomProvider } from "@/components/ProvidersManager";
import ExternalSites from "@/components/ExternalSites";
import AboutSidebar from "@/components/AboutSidebar";
import ResultsList from "@/components/ResultsList";
import { mergeClient } from "@/lib/clientMerge";
import { rankResults } from "@/lib/rank";
import { useI18n } from "@/components/I18nProvider";
import { getCache, setCache, makeKey } from "@/lib/searchCache";

type ProviderKey =
  | "gutenberg"
  | "internet_archive"
  | "open_library"
  | `opds:${string}`
  | `scrape:${string}`;

type CacheData = {
  baseResults: BookResult[];
  byProvider: Record<string, BookResult[]>;
};

export default function HomePage() {
  const { t, locale } = useI18n();

  const [q, setQ] = useState("");
  const [onlyPdf, setOnlyPdf] = useState(true);
  const [preferExternal, setPreferExternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [baseResults, setBaseResults] = useState<BookResult[]>([]);
  const [byProvider, setByProvider] = useState<Record<string, BookResult[]>>({});
  const [customProviders, setCustomProviders] = useState<CustomProvider[]>([]);
  const [showManagers, setShowManagers] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mergedRanked = useMemo(() => {
    const merged = mergeClient([...baseResults, ...Object.values(byProvider).flat()]);
    const ranked = q.trim() ? rankResults(q, merged) : merged;
    if (!preferExternal) return ranked;
    const isExternal = (b: BookResult) =>
      (b.id && (b.id.startsWith("scrape:") || b.id.startsWith("opds:"))) ||
      b.source === "scrape" ||
      b.source === "opds";
    const ext = ranked.filter(isExternal);
    const rest = ranked.filter((b) => !isExternal(b));
    return [...ext, ...rest];
  }, [baseResults, byProvider, q, preferExternal]);

  const providersSignature = useMemo(() => {
    if (!customProviders.length) return "none";
    const basic = customProviders
      .map((p) => (p.type === "opds" ? `opds:${p.url}` : `scrape:${p.name}`))
      .sort()
      .join(",");
    return basic || "none";
  }, [customProviders]);

  const cacheKeyFor = useCallback(
    (query: string, pdfOnly: boolean) =>
      makeKey([
        "search",
        `q:${query.trim().toLowerCase()}`,
        `pdf:${pdfOnly ? 1 : 0}`,
        `prov:${providersSignature}`,
      ]),
    [providersSignature]
  );

  const runSearch = useCallback(
    async (query: string, pdfOnly: boolean) => {
      if (!query.trim()) {
        setBaseResults([]);
        setByProvider({});
        return;
      }

      const key = cacheKeyFor(query, pdfOnly);
      const cached = getCache<CacheData>(key);
      if (cached) {
        setBaseResults(cached.baseResults);
        setByProvider(cached.byProvider);
        return;
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      setLoading(true);
      setBaseResults([]);
      setByProvider({});

      let localBase: BookResult[] = [];
      const localByProv: Record<string, BookResult[]> = {};

      try {
        const pBase = fetch(
          `/api/search?${new URLSearchParams({ q: query, onlyPdf: pdfOnly ? "1" : "0" })}`,
          { signal }
        )
          .then((r) => r.json())
          .then((d: { results?: BookResult[] }) => {
            if (signal.aborted) return;
            localBase = d.results || [];
            setBaseResults(localBase);
          });

        const pCustom = customProviders.map(async (p) => {
          if (signal.aborted) return;
          if (p.type === "opds") {
            const keyProv: ProviderKey = `opds:${p.url}`;
            return fetch(
              `/api/search-by-provider?${new URLSearchParams({ provider: "opds", feed: p.url, q: query })}`,
              { signal }
            )
              .then((r) => r.json())
              .then((d: { results?: BookResult[] }) => {
                if (signal.aborted) return;
                const rows = (d.results || []).filter((x) => (pdfOnly ? !!x.pdfUrl : true));
                localByProv[keyProv] = rows;
                setByProvider((prev) => ({ ...prev, [keyProv]: rows }));
              })
              .catch(() => {});
          } else {
            const keyProv: ProviderKey = `scrape:${p.name}`;
            return fetch(`/api/scrape`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ q: query, config: p }),
              signal,
            })
              .then((r) => r.json())
              .then((d: { results?: BookResult[] }) => {
                if (signal.aborted) return;
                const rows = (d.results || []).filter((x) => (pdfOnly ? !!x.pdfUrl : true));
                localByProv[keyProv] = rows;
                setByProvider((prev) => ({ ...prev, [keyProv]: rows }));
              })
              .catch(() => {});
          }
        });

        await Promise.race([
          Promise.allSettled([pBase, ...pCustom]),
          new Promise((res) => setTimeout(res, 6000)),
        ]);

        if (!signal.aborted) {
          setCache(key, { baseResults: localBase, byProvider: localByProv });
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [customProviders, cacheKeyFor]
  );

  useEffect(() => {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => runSearch(q, onlyPdf), 340);
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    };
  }, [q, onlyPdf, runSearch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQ(initial);
  }, []);

  const focusManagers = useCallback(() => {
    setShowManagers(true);
    setTimeout(() => {
      const el = document.getElementById("providers-manager");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, []);

  const pdfParam = onlyPdf ? (locale === "en" ? "with PDF " : "com PDF ") : "";

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-5">
      <div className="md:hidden flex gap-2 mb-3">
        <button
          type="button"
          className={`btn-ghost flex-1 ${showInfo ? "ring-1 ring-[color-mix(in_oklch,var(--color-brand)_40%,transparent)]" : ""}`}
          onClick={() => setShowInfo((v) => !v)}
          aria-expanded={showInfo}
        >
          Informações
        </button>
        <button
          type="button"
          className={`btn-ghost flex-1 ${showManagers ? "ring-1 ring-[color-mix(in_oklch,var(--color-brand)_40%,transparent)]" : ""}`}
          onClick={() => setShowManagers((v) => !v)}
          aria-controls="providers-manager"
          aria-expanded={showManagers}
        >
          Gerenciar provedores
        </button>
      </div>

      {showInfo && (
        <div className="md:hidden mb-3 card">
          <AboutSidebar onManageClick={focusManagers} />
        </div>
      )}

      <div className="md:grid md:grid-cols-[260px_1fr] md:gap-5">
        <div className="hidden md:block sticky top-3 self-start space-y-3">
          <AboutSidebar onManageClick={focusManagers} />
        </div>

        <section>
          <h1 className="text-[22px] md:text-[26px] font-bold mb-1.5 leading-tight">
            {t("home.title")}
          </h1>
          <p className="text-muted mb-2 text-[14.5px] leading-snug">{t("home.tagline")}</p>

          <form onSubmit={(e) => e.preventDefault()} className="mb-2">
            <div className="toolbar w-full flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("search.placeholder")}
                  aria-label={t("search.aria")}
                  className="field pr-10"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2">/</kbd>
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={onlyPdf}
                    onChange={(e) => setOnlyPdf(e.target.checked)}
                  />
                  {t("search.onlyPdf")}
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferExternal}
                    onChange={(e) => setPreferExternal(e.target.checked)}
                  />
                  {t("search.prioritizeExternal")}
                </label>
              </div>
            </div>
          </form>

          <div aria-live="polite" className="sr-only">
            {loading ? t("results.searching") : t("results.count", { n: mergedRanked.length })}
          </div>

          {loading && mergedRanked.length === 0 ? (
            <div className="grid gap-2.5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : mergedRanked.length === 0 && q.trim() ? (
            <p className="text-muted">{t("results.none", { q, pdf: pdfParam })}</p>
          ) : (
            <ResultsList items={mergedRanked} pageSize={4} />
          )}

          <div
            id="providers-manager"
            className={`mt-6 space-y-4 ${showManagers ? "" : "hidden md:block"}`}
          >
            <ProvidersManager onChange={setCustomProviders} />
            <ExternalSites currentQuery={q} />
          </div>

          <footer className="mt-6 text-xs text-muted">{t("footer.disclaimer")}</footer>
        </section>
      </div>
    </main>
  );
}
