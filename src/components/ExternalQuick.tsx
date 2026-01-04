"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Globe, Sparkles } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { RECOMMENDED_SITES } from "@/lib/recommendedSites";
import { toast } from "sonner";

type Site = { name: string; url: string };

export default function ExternalQuick() {
  const { t } = useI18n();
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("biblio_external_sites");
      if (saved) setSites(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (newSites: Site[]) => {
    setSites(newSites);
    localStorage.setItem("biblio_external_sites", JSON.stringify(newSites));
    window.dispatchEvent(new Event("external-sites-updated"));
  };

  const add = () => {
    if (!name || !url.startsWith("http")) return;
    save([...sites, { name, url }]);
    setName("");
    setUrl("");
    toast.success("Site adicionado!");
  };

  const remove = (index: number) => {
    save(sites.filter((_, i) => i !== index));
    toast("Site removido", { icon: "🗑️" });
  };

  const addRecommended = () => {
    const newSites = [...sites];
    let addedCount = 0;

    RECOMMENDED_SITES.forEach(rec => {
      if (!newSites.some(s => s.url === rec.url)) {
        newSites.push({ name: rec.name, url: rec.url });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      save(newSites);
      toast.success(`${addedCount} fontes adicionadas!`);
    } else {
      toast.info("Já possui todas as sugestões.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20">
            <p className="mb-4 text-sm">{t("ext.quick.none")}</p>
            <button onClick={addRecommended} className="btn-primary btn-sm gap-2">
              <Sparkles size={14} />
              Adicionar Sugestões
            </button>
          </div>
        ) : (
          <div className="grid gap-2">
            {sites.map((site, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Globe size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate text-foreground">{site.name}</p>
                    <p className="text-xs text-muted-foreground truncate opacity-70 font-mono">{site.url}</p>
                  </div>
                </div>
                <button
                  onClick={() => remove(i)}
                  className="btn-icon text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title={t("common.remove")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 rounded-xl bg-muted/30 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Plus size={16} className="text-primary" />
            {t("ext.quick.add")}
          </h4>
          {sites.length > 0 && (
            <button onClick={addRecommended} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Sparkles size={12} />
              Recarregar sugestões
            </button>
          )}
        </div>
        
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <input
            className="field bg-background"
            placeholder={t("ext.namePh")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="field bg-background"
            placeholder={t("ext.urlPh")}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
            onClick={add} 
            disabled={!name || !url}
            className="btn-primary w-full sm:w-auto"
          >
            {t("ext.add")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Dica: Use <code>{`{query}`}</code> onde o termo pesquisado deve entrar.
        </p>
      </div>
    </div>
  );
}