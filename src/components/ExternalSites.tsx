"use client";

import { useEffect, useState } from "react";
import { Globe, Search, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useSettings } from "@/lib/useSettings";
import { getSmartUrl, getFaviconUrl } from "@/lib/smartLinks";
/* eslint-disable @next/next/no-img-element */

type Site = { name: string; url: string };

const DEFAULT_SITES: Site[] = [
  { name: "Google Scholar", url: "https://scholar.google.com.br/scholar?q={query}" },
  { name: "SciELO", url: "https://search.scielo.org/?q={query}&lang=pt" },
  { name: "Google Books", url: "https://www.google.com/search?tbm=bks&q={query}" },
  { name: "Internet Archive", url: "https://archive.org/search.php?query={query}" },
  { name: "Anna's Archive", url: "https://annas-archive.org/search?q={query}" }
];

export default function ExternalSites({ 
  currentQuery
}: { 
  currentQuery: string;
  onManageClick?: () => void;
}) {
  const {} = useI18n();
  const { settings } = useSettings();
  const [sites, setSites] = useState<Site[]>([]);
  const [, setIsUsingDefaults] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem("biblio_external_sites");
        if (saved && JSON.parse(saved).length > 0) {
          setSites(JSON.parse(saved));
          setIsUsingDefaults(false);
        } else {
          setSites(DEFAULT_SITES);
          setIsUsingDefaults(true);
        }
      } catch {
        setSites(DEFAULT_SITES);
      }
    };
    load();
    window.addEventListener("external-sites-updated", load);
    return () => window.removeEventListener("external-sites-updated", load);
  }, []);

  if (!currentQuery.trim()) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Search size={20} className="text-primary"/>
            Busca Profunda (Web)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Pesquisar &quot;<strong>{currentQuery}</strong>&quot; diretamente nas fontes originais:
          </p>
        </div>
        
        {settings.searchLanguage !== "all" && (
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded font-bold uppercase tracking-wide">
            Filtro: {settings.searchLanguage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sites.map((site, i) => {
          const smartUrl = getSmartUrl(site.url, currentQuery, settings.searchLanguage);
          const iconUrl = getFaviconUrl(site.url);

          return (
            <a
              key={i}
              href={smartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline"
            >
              <div className="h-10 w-10 shrink-0 rounded-lg bg-muted/50 p-1.5 border border-border group-hover:border-primary/20 transition-colors">
                <img 
                  src={iconUrl} 
                  alt="" 
                  className="h-full w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} 
                />
                <div className="hidden h-full w-full items-center justify-center text-muted-foreground">
                  <Globe size={16} />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {site.name}
                  </span>
                  <ArrowUpRight size={10} className="text-muted-foreground opacity-50 group-hover:text-primary group-hover:opacity-100 transition-all" />
                </div>
                
                <span className="block text-[11px] text-muted-foreground truncate opacity-70 group-hover:opacity-100 font-mono">
                  {/* Safe URL parse */}
                  {(() => { try { return new URL(smartUrl).hostname.replace("www.", ""); } catch { return ""; } })()}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}