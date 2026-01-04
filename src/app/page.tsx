"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BookResult } from "@/lib/types";
import SkeletonCard from "@/components/SkeletonCard";
import ExternalSites from "@/components/ExternalSites";
import AboutSidebar from "@/components/AboutSidebar";
import ResultsList from "@/components/ResultsList";
import FeaturedView from "@/components/FeaturedView";
import SearchHistory from "@/components/SearchHistory";
import { addToHistory } from "@/lib/history";
import { mergeClient } from "@/lib/clientMerge";
import { rankResults } from "@/lib/rank";
import { useI18n } from "@/components/I18nProvider";
import { getCache, setCache, makeKey } from "@/lib/searchCache";
import { Search, Share2, Sparkles, Languages } from "lucide-react";
import { toast } from "sonner";
import { useCustomProviders } from "@/lib/useCustomProviders";
import { useSettings } from "@/lib/useSettings";

type CacheData = {
  baseResults: BookResult[];
  byProvider: Record<string, BookResult[]>;
};

export default function HomePage() {
  const { t } = useI18n();
  const { providers: customProviders } = useCustomProviders();
  const { settings } = useSettings();
  
  const [q, setQ] = useState("");
  const [onlyPdf, setOnlyPdf] = useState(true);
  const [loading, setLoading] = useState(false);
  const [baseResults, setBaseResults] = useState<BookResult[]>([]);
  const [byProvider, setByProvider] = useState<Record<string, BookResult[]>>({});
  const [showInfo, setShowInfo] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "/" && !e.metaKey && !e.ctrlKey) || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mergedRanked = useMemo(() => {
    const all = [...baseResults, ...Object.values(byProvider).flat()];
    const merged = mergeClient(all);
    return q.trim() ? rankResults(q, merged) : merged;
  }, [baseResults, byProvider, q]);

  const runSearch = useCallback(async (query: string, pdfOnly: boolean) => {
    if (!query.trim()) { 
      setBaseResults([]); setByProvider({}); return; 
    }

    // LÓGICA DE IDIOMA CORRIGIDA
    let nativeQuery = query;
    if (settings.searchLanguage !== "all") {
      const langMap: Record<string, string> = { "pt": "portuguese", "en": "english", "es": "spanish" };
      const langTerm = langMap[settings.searchLanguage] || settings.searchLanguage;
      nativeQuery += ` language:${langTerm}`;
    }

    const customQuery = query;

    const sig = customProviders.map(p => (p.type === "opds" ? p.url : p.name)).sort().join(",");
    const cacheKey = makeKey(["search", `q:${nativeQuery.toLowerCase()}`, `pdf:${pdfOnly}`, `prov:${sig}`]);
    const cached = getCache<CacheData>(cacheKey);
    
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

    try {
      const fetchBase = fetch(`/api/search?q=${encodeURIComponent(nativeQuery)}&onlyPdf=${pdfOnly ? 1 : 0}`, { signal })
        .then(r => r.json())
        .then(d => { 
          if (!signal.aborted) setBaseResults(d.results || []); 
          return d.results || []; 
        })
        .catch(() => []);
      
      const customPromises = customProviders.map(async (p) => {
        if (signal.aborted) return [];
        try {
          const res = await fetch(p.type === "opds" 
            ? `/api/search-by-provider?provider=opds&feed=${encodeURIComponent(p.url)}&q=${encodeURIComponent(customQuery)}` 
            : `/api/scrape`, { 
              method: p.type === "opds" ? "GET" : "POST", 
              headers: p.type === "opds" ? {} : { "Content-Type": "application/json" },
              body: p.type === "opds" ? undefined : JSON.stringify({ q: customQuery, config: p }),
              signal 
            });
          const data = await res.json();
          if (!signal.aborted) {
            const list = (data.results || []).filter((x: BookResult) => !pdfOnly || x.pdfUrl);
            setByProvider(prev => ({ ...prev, [p.type === "opds" ? `opds:${p.url}` : `scrape:${p.name}`]: list }));
            return list;
          }
          return [];
        } catch { return []; }
      });

      const [baseRes, ...customRes] = await Promise.all([fetchBase, ...customPromises]);
      
      if (!signal.aborted) {
        const resultByProv: Record<string, BookResult[]> = {};
        customProviders.forEach((p, i) => { 
          const key = p.type === "opds" ? `opds:${p.url}` : `scrape:${p.name}`; 
          resultByProv[key] = customRes[i] || []; 
        });
        setCache(cacheKey, { baseResults: baseRes, byProvider: resultByProv });
      }
    } finally { if (!signal.aborted) setLoading(false); }
  }, [customProviders, settings.searchLanguage]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      runSearch(q, onlyPdf);
      if (q.trim().length > 2) addToHistory(q.trim());
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, onlyPdf, runSearch]);

  const shareSearch = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link copiado!", { icon: "🔗" }); };
  const handleHistorySelect = (term: string) => { setQ(term); setHistoryOpen(false); inputRef.current?.blur(); };
  const cleanPlaceholder = t("search.placeholder").replace(/\(.*\)/, "").trim();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 relative min-h-screen flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary/5 blur-[100px] -z-10 rounded-full pointer-events-none" />

      <div className="flex gap-2 mb-6 md:hidden sticky top-16 z-20 bg-background/80 backdrop-blur-md p-2 -mx-2 border-b border-border/50">
        <button className={`btn-ghost flex-1 ${showInfo ? "bg-muted" : ""}`} onClick={() => setShowInfo(!showInfo)}>Informações</button>
      </div>

      {showInfo && <div className="mb-8 md:hidden animate-in fade-in slide-in-from-top-2"><AboutSidebar onManageClick={() => {}} /></div>}

      <div className="grid gap-12 md:grid-cols-[280px_1fr]">
        <aside className="hidden md:block sticky top-24 self-start">
          <AboutSidebar onManageClick={() => {}} />
        </aside>

        <section className="min-w-0 flex-1 flex flex-col relative z-10">
          <div className="space-y-4 pt-8 md:pt-12 text-center md:text-left mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t("home.title")}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t("home.tagline")}
            </p>
          </div>

          <div className="sticky top-20 z-30 group mx-auto md:mx-0 max-w-2xl md:max-w-none w-full mb-10">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/30 to-purple-600/30 opacity-0 blur transition duration-500 group-focus-within:opacity-70" />
            <div className="relative rounded-2xl border border-border/60 bg-background/80 p-2 shadow-xl backdrop-blur-xl transition-all">
              <form onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur(); }} className="flex flex-col gap-3 sm:flex-row sm:items-center relative">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onFocus={() => setHistoryOpen(true)}
                    onBlur={() => setTimeout(() => setHistoryOpen(false), 200)}
                    placeholder={cleanPlaceholder || "Pesquisar..."}
                    className="field h-12 w-full rounded-xl bg-transparent pl-12 pr-12 text-lg shadow-none border-transparent focus:ring-0 focus:border-transparent placeholder:text-muted-foreground/50"
                    autoComplete="off"
                  />
                  <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border border-border bg-muted/50 px-2 font-mono text-xs font-medium text-muted-foreground opacity-60 sm:flex">
                    /
                  </kbd>
                  <SearchHistory visible={historyOpen && q === ""} onSelect={handleHistorySelect} />
                </div>
                
                <div className="flex items-center gap-2 px-2 pb-2 sm:pb-0 justify-between sm:justify-end border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                  
                  {settings.searchLanguage !== "all" && (
                    <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 cursor-help" title={`Filtrando por ${settings.searchLanguage}`}>
                      <Languages size={10} />
                      {settings.searchLanguage.toUpperCase()}
                    </span>
                  )}

                  <label className="chip h-9 px-3 cursor-pointer hover:bg-muted/80 transition-colors select-none bg-muted/30 border-border/50">
                    <input type="checkbox" checked={onlyPdf} onChange={(e) => setOnlyPdf(e.target.checked)} className="accent-primary mr-2 h-4 w-4" />
                    {t("search.onlyPdf")}
                  </label>
                  {q.trim() && (
                    <button onClick={shareSearch} className="btn-icon h-9 w-9 bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors" title="Compartilhar" type="button">
                      <Share2 size={18} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="flex-1 min-h-[400px]">
            {q.trim() ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {loading && mergedRanked.length === 0 ? (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                     {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : mergedRanked.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/5">
                    <div className="mb-4 rounded-full bg-muted/50 p-6 shadow-inner"><Sparkles size={40} strokeWidth={1} className="text-primary/50" /></div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nada encontrado</h3>
                    <p className="text-sm max-w-xs mx-auto text-muted-foreground text-center">
                      Verifique a ortografia ou tente remover o filtro de PDF.
                      {settings.searchLanguage !== "all" && (
                        <span className="block mt-2 text-primary font-medium">
                          {/* CORRIGIDO AQUI: Aspas substituídas por &quot; */}
                          Filtro de idioma ativo: {settings.searchLanguage.toUpperCase()}. Tente mudar para &quot;Global&quot; nas configurações.
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <ResultsList items={mergedRanked} pageSize={12} />
                )}
                
                <ExternalSites currentQuery={q} />
              </div>
            ) : (
              <FeaturedView />
            )}
          </div>

          <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground/60 mt-12">
            {t("footer.disclaimer")}
          </footer>
        </section>
      </div>
    </div>
  );
}