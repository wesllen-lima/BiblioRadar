"use client";

import { useI18n } from "./I18nProvider";
import { useCustomProviders } from "@/lib/useCustomProviders";
import { BookOpen, Library, Rss, Globe, Activity, Settings } from "lucide-react";
import Link from "next/link";

export default function AboutSidebar({ onManageClick }: { onManageClick?: () => void }) {
  const { t } = useI18n();
  const { providers } = useCustomProviders();

  const nativeSources = [
    { name: "Project Gutenberg", icon: BookOpen },
    { name: "Internet Archive", icon: Library },
    { name: "Open Library", icon: Library },
  ];

  const totalActive = nativeSources.length + providers.length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-5 sticky top-24">
      
      <div>
        <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
          {t("about.title")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {t("about.desc")}
        </p>
      </div>

      <hr className="border-border/60" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Activity size={12} className="text-emerald-500" />
            {t("about.sources")}
          </h4>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {totalActive} ONLINE
          </span>
        </div>

        <ul className="space-y-2">
          {nativeSources.map((s, i) => (
            <li key={i} className="flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2.5 text-foreground/80">
                <span className="text-muted-foreground group-hover:text-primary transition-colors">
                  <s.icon size={14} />
                </span>
                {s.name}
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </li>
          ))}

          {providers.map((p, i) => {
            // CORREÇÃO: Verifica se 'name' existe. Se não (caso do OPDS), usa a URL formatada ou um fallback.
            const displayName = "name" in p ? p.name : (p.url.replace(/^https?:\/\//, "").split("/")[0] || "OPDS Feed");
            
            return (
              <li key={`cust-${i}`} className="flex items-center justify-between text-sm group">
                <div className="flex items-center gap-2.5 text-foreground/80">
                  <span className="text-blue-500">
                    {p.type === "opds" ? <Rss size={14} /> : <Globe size={14} />}
                  </span>
                  <span className="truncate max-w-[140px]" title={displayName}>
                    {displayName}
                  </span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-2">
        {onManageClick ? (
          <button 
            onClick={onManageClick} 
            className="btn-outline w-full text-xs h-8 gap-2 hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Settings size={12} />
            {t("providers.configure")}
          </button>
        ) : (
          <Link 
            href="/settings" 
            className="btn-outline w-full text-xs h-8 gap-2 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Settings size={12} />
            {t("providers.configure")}
          </Link>
        )}
      </div>
    </div>
  );
}