"use client";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { writeJSONCookie, readJSONCookie } from "@/lib/cookieStore";

export type CustomProvider =
  | { type: "opds"; url: string }
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
  const [opdsUrl, setOpdsUrl] = useState("");
  const [opdsErr, setOpdsErr] = useState("");

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
  }, [providers, onChange]);

  const addOpds = () => {
    const url = opdsUrl.trim();
    const ok = isValidHttpUrl(url);
    setOpdsErr(ok ? "" : t("pm.err.url"));
    if (!ok) return;
    if (providers.some((p) => p.type === "opds" && (p as any).url === url)) return;
    setProviders([{ type: "opds", url }, ...providers]);
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
    if (providers.some((p) => p.type === "scrape" && (p as any).name === name)) return;
    setProviders([cfg, ...providers]);
    setScrName("");
    setScrUrl("");
    setScrRoot("");
    setScrTitle("");
    setScrHref("");
    setScrCover("");
    setScrAuthor("");
    setScrYear("");
    setScrErrUrl("");
    setScrErrReq("");
  };

  const removeAt = (i: number) => {
    setProviders(providers.filter((_, idx) => idx !== i));
  };

  const opdsDisabled = !isValidHttpUrl(opdsUrl.trim());
  const scrDisabled = !scrName.trim() || !isValidHttpUrl(scrUrl.trim()) || !scrRoot.trim() || !scrTitle.trim() || !scrHref.trim();

  const listKey = useMemo(() => providers.map((p) => (p.type === "opds" ? `opds:${(p as any).url}` : `scrape:${(p as any).name}`)).join("|"), [providers]);

  return (
    <section className="mt-4">
      <h2 className="text-base font-semibold mb-2">{t("pm.title")}</h2>

      <div className="toolbar w-full mb-3">
        <div className="flex gap-1">
          <button
            type="button"
            className={`btn-sm ${tab === "opds" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("opds")}
          >
            {t("pm.tab.opds")}
          </button>
          <button
            type="button"
            className={`btn-sm ${tab === "scraper" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("scraper")}
          >
            {t("pm.tab.scraper")}
          </button>
        </div>
      </div>

      {tab === "opds" ? (
        <div className="card space-y-2">
          <input
            value={opdsUrl}
            onChange={(e) => {
              setOpdsUrl(e.target.value);
              if (opdsErr) setOpdsErr("");
            }}
            onBlur={() => {
              if (!isValidHttpUrl(opdsUrl.trim())) setOpdsErr(t("pm.err.url"));
            }}
            placeholder={t("pm.opds.placeholder")}
            aria-invalid={!!opdsErr}
            aria-describedby={opdsErr ? "opds-err" : undefined}
            className={`field ${opdsErr ? "border-red-500 focus-visible:outline-red-500" : ""}`}
          />
          {opdsErr ? <p id="opds-err" className="text-xs text-red-600">{opdsErr}</p> : null}
          <div className="flex items-center gap-2">
            <button onClick={addOpds} disabled={opdsDisabled} className={`btn-primary btn-sm ${opdsDisabled ? "opacity-60 cursor-not-allowed" : ""}`}>
              {t("pm.opds.add")}
            </button>
            <span className="text-xs text-muted">{t("pm.opds.note")}</span>
          </div>
        </div>
      ) : (
        <div className="card space-y-2">
          <input
            value={scrName}
            onChange={(e) => setScrName(e.target.value)}
            placeholder={t("pm.scr.name")}
            className="field"
          />
          <input
            value={scrUrl}
            onChange={(e) => {
              setScrUrl(e.target.value);
              if (scrErrUrl) setScrErrUrl("");
            }}
            onBlur={() => {
              if (!isValidHttpUrl(scrUrl.trim())) setScrErrUrl(t("pm.err.nameUrl"));
            }}
            placeholder={t("pm.scr.url", { query: "{query}", plus: "{plus}", raw: "{raw}" })}
            aria-invalid={!!scrErrUrl}
            aria-describedby={scrErrUrl ? "scr-url-err" : undefined}
            className={`field ${scrErrUrl ? "border-red-500 focus-visible:outline-red-500" : ""}`}
          />
          {scrErrUrl ? <p id="scr-url-err" className="text-xs text-red-600">{scrErrUrl}</p> : null}

          <input value={scrRoot} onChange={(e) => setScrRoot(e.target.value)} placeholder={t("pm.scr.sel.root")} className="field" />
          <input value={scrTitle} onChange={(e) => setScrTitle(e.target.value)} placeholder={t("pm.scr.sel.title")} className="field" />
          <input value={scrHref} onChange={(e) => setScrHref(e.target.value)} placeholder={t("pm.scr.sel.href")} className="field" />
          <input value={scrCover} onChange={(e) => setScrCover(e.target.value)} placeholder={t("pm.scr.sel.cover")} className="field" />
          <input value={scrAuthor} onChange={(e) => setScrAuthor(e.target.value)} placeholder={t("pm.scr.sel.author")} className="field" />
          <input value={scrYear} onChange={(e) => setScrYear(e.target.value)} placeholder={t("pm.scr.sel.year")} className="field" />

          {scrErrReq ? <p className="text-xs text-red-600">{scrErrReq}</p> : null}

          <button onClick={addScraper} disabled={scrDisabled} className={`btn-primary btn-sm ${scrDisabled ? "opacity-60 cursor-not-allowed" : ""}`}>
            {t("pm.scr.add")}
          </button>
        </div>
      )}

      <ul key={listKey} className="mt-3 grid gap-2">
        {providers.length === 0 ? null : providers.map((p, i) => (
          <li key={`${p.type}:${i}`} className="card flex items-center justify-between gap-3">
            <div className="text-sm">
              {p.type === "opds" ? (
                <>
                  <span className="chip">OPDS</span>{" "}
                  <code className="text-xs break-all">{(p as any).url}</code>
                </>
              ) : (
                <>
                  <span className="chip">Scraper</span>{" "}
                  <span className="font-medium">{(p as any).name}</span>{" "}
                  <span className="text-xs text-muted">— {(p as any).searchUrlTemplate}</span>
                </>
              )}
            </div>
            <button className="btn btn-sm" onClick={() => removeAt(i)}>{t("common.remove")}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
