"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { writeJSONCookie, readJSONCookie } from "@/lib/cookieStore";
import { Plus, Trash2, Rss, Globe, Code } from "lucide-react";

export type CustomProvider =
  | { type: "opds"; url: string; name?: string }
  | {
      type: "scrape";
      name: string;
      searchUrlTemplate: string;
      itemSelector: string;
      titleSelector: string;
      linkSelector: string;
      coverSelector?: string;
      authorSelector?: string;
      yearSelector?: string;
    };

const CK = "br_custom_providers_v1";

function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProvidersManager({ onChange }: { onChange?: (arr: CustomProvider[]) => void }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"opds" | "scraper">("opds");
  const [providers, setProviders] = useState<CustomProvider[]>([]);
  
  // OPDS State
  const [opdsUrl, setOpdsUrl] = useState("");
  const [opdsErr, setOpdsErr] = useState("");

  // Scraper State
  const [scrName, setScrName] = useState("");
  const [scrUrl, setScrUrl] = useState("");
  const [scrRoot, setScrRoot] = useState("");
  const [scrTitle, setScrTitle] = useState("");
  const [scrHref, setScrHref] = useState("");
  const [scrCover, setScrCover] = useState("");
  const [scrAuthor, setScrAuthor] = useState("");
  const [scrYear, setScrYear] = useState("");
  const [scrErrUrl, setScrErrUrl] = useState("");
  const [scrErrReq, setScrErrReq] = useState("");

  useEffect(() => {
    const initial = readJSONCookie<CustomProvider[]>(CK, []);
    setProviders(initial);
    onChange?.(initial);
  }, [onChange]);

  useEffect(() => {
    writeJSONCookie(CK, providers);
    onChange?.(providers);
    // Dispara evento para atualizar outras partes do app (como o sidebar)
    window.dispatchEvent(new Event("providers-updated"));
  }, [providers, onChange]);

  const addOpds = () => {
    const url = opdsUrl.trim();
    const ok = isValidHttpUrl(url);
    setOpdsErr(ok ? "" : t("pm.err.url"));
    if (!ok) return;
    if (providers.some((p) => p.type === "opds" && p.url === url)) return;
    
    // Tenta extrair um nome amigável da URL
    const name = url.replace(/^https?:\/\//, "").split("/")[0];
    
    setProviders([{ type: "opds", url, name }, ...providers]);
    setOpdsUrl("");
    setOpdsErr("");
  };

  const addScraper = () => {
    const name = scrName.trim();
    const url = scrUrl.trim();
    const must = scrRoot.trim() && scrTitle.trim() && scrHref.trim();
    const urlOk = isValidHttpUrl(url);
    setScrErrUrl(urlOk ? "" : t("pm.err.nameUrl"));
    setScrErrReq(must ? "" : t("pm.err.selectors"));
    if (!urlOk || !must || !name) return;
    const cfg: CustomProvider = {
      type: "scrape",
      name,
      searchUrlTemplate: url,
      itemSelector: scrRoot.trim(),
      titleSelector: scrTitle.trim(),
      linkSelector: scrHref.trim(),
      coverSelector: scrCover.trim() || undefined,
      authorSelector: scrAuthor.trim() || undefined,
      yearSelector: scrYear.trim() || undefined,
    };
    if (providers.some((p) => p.type === "scrape" && p.name === name)) return;
    setProviders([cfg, ...providers]);
    setScrName(""); setScrUrl(""); setScrRoot(""); setScrTitle(""); setScrHref("");
    setScrCover(""); setScrAuthor(""); setScrYear(""); setScrErrUrl(""); setScrErrReq("");
  };

  const removeAt = (i: number) => {
    setProviders(providers.filter((_, idx) => idx !== i));
  };

  const opdsDisabled = !isValidHttpUrl(opdsUrl.trim());
  const scrDisabled = !scrName.trim() || !isValidHttpUrl(scrUrl.trim()) || !scrRoot.trim() || !scrTitle.trim() || !scrHref.trim();

  return (
    <section className="space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-muted/50 rounded-lg w-fit">
        <button
          type="button"
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${tab === "opds" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setTab("opds")}
        >
          {t("pm.tab.opds")}
        </button>
        <button
          type="button"
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${tab === "scraper" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setTab("scraper")}
        >
          {t("pm.tab.scraper")}
        </button>
      </div>

      {/* Formulários */}
      <div className="p-5 rounded-xl border border-border bg-muted/20">
        {tab === "opds" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL do Feed OPDS</label>
              <div className="flex gap-2">
                <input
                  value={opdsUrl}
                  onChange={(e) => {
                    setOpdsUrl(e.target.value);
                    if (opdsErr) setOpdsErr("");
                  }}
                  onBlur={() => { if (!isValidHttpUrl(opdsUrl.trim())) setOpdsErr(t("pm.err.url")); }}
                  placeholder="https://exemplo.com/opds/feed.xml"
                  className={`field flex-1 ${opdsErr ? "border-red-500 focus-visible:border-red-500" : ""}`}
                />
                <button
                  onClick={addOpds}
                  disabled={opdsDisabled}
                  className="btn-primary"
                >
                  {t("pm.opds.add")}
                </button>
              </div>
              {opdsErr && <p className="text-xs text-red-600 mt-1.5">{opdsErr}</p>}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Rss size={12} />
              Feeds OPDS são padrões abertos usados por bibliotecas digitais (ex: Standard Ebooks, Project Gutenberg).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={scrName} onChange={(e) => setScrName(e.target.value)} placeholder={t("pm.scr.name")} className="field" />
              <input 
                value={scrUrl} 
                onChange={(e) => { setScrUrl(e.target.value); if (scrErrUrl) setScrErrUrl(""); }}
                onBlur={() => { if (!isValidHttpUrl(scrUrl.trim())) setScrErrUrl(t("pm.err.nameUrl")); }}
                placeholder={t("pm.scr.url")} 
                className={`field ${scrErrUrl ? "border-red-500" : ""}`}
              />
            </div>
            {scrErrUrl && <p className="text-xs text-red-600">{scrErrUrl}</p>}

            <div className="p-4 rounded-lg bg-background border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Code size={12} /> Seletores CSS (Obrigatórios)
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={scrRoot} onChange={(e) => setScrRoot(e.target.value)} placeholder="Item Raiz (ex: .book-card)" className="field" />
                <input value={scrTitle} onChange={(e) => setScrTitle(e.target.value)} placeholder="Título (ex: h3 > a)" className="field" />
                <input value={scrHref} onChange={(e) => setScrHref(e.target.value)} placeholder="Link (ex: a.download)" className="field" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Opcionais</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={scrCover} onChange={(e) => setScrCover(e.target.value)} placeholder="Capa (img src)" className="field" />
                <input value={scrAuthor} onChange={(e) => setScrAuthor(e.target.value)} placeholder="Autor (ex: .author)" className="field" />
                <input value={scrYear} onChange={(e) => setScrYear(e.target.value)} placeholder="Ano" className="field" />
              </div>
            </div>

            {scrErrReq && <p className="text-xs text-red-600">{scrErrReq}</p>}

            <button onClick={addScraper} disabled={scrDisabled} className="btn-primary w-full sm:w-auto">
              <Plus size={16} />
              {t("pm.scr.add")}
            </button>
          </div>
        )}
      </div>

      {/* Lista de Provedores Ativos */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Fontes Ativas ({providers.length})</h4>
        
        {providers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Nenhuma fonte personalizada adicionada.</p>
        ) : (
          <div className="grid gap-2">
            {providers.map((p, i) => (
              <div key={`${p.type}:${i}`} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${p.type === "opds" ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"}`}>
                    {p.type === "opds" ? <Rss size={16} /> : <Globe size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate text-foreground">
                        {p.name || (p.type === "opds" ? "Feed OPDS" : "Scraper")}
                      </p>
                      <span className="text-[10px] font-mono uppercase bg-muted px-1.5 rounded text-muted-foreground border border-border">
                        {p.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate opacity-70 font-mono">
                      {p.type === "opds" ? p.url : p.searchUrlTemplate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeAt(i)}
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
    </section>
  );
}