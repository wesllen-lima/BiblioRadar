"use client";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

type ExternalSite = { name: string; template: string };
const LS_KEY = "external_sites_v2";

function buildUrl(tpl: string, q: string) {
  const enc = encodeURIComponent(q);
  const plus = q.trim().replace(/\s+/g, "+");
  if (tpl.includes("{plus}")) return tpl.replaceAll("{plus}", plus);
  if (tpl.includes("{raw}")) return tpl.replaceAll("{raw}", q);
  if (tpl.includes("{query}")) return tpl.replaceAll("{query}", enc);
  const hasQ = tpl.includes("?");
  return `${tpl}${hasQ ? "&" : "?"}q=${enc}`;
}
function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ExternalSites({ currentQuery }: { currentQuery: string }) {
  const { t } = useI18n();
  const [sites, setSites] = useState<ExternalSite[]>([]);
  const [name, setName] = useState("");
  const [tpl, setTpl] = useState("");
  const [errName, setErrName] = useState("");
  const [errTpl, setErrTpl] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY) || "[]";
      setSites(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(sites));
  }, [sites]);

  function add() {
    const n = name.trim();
    const turl = tpl.trim();
    const nameOk = n.length >= 2;
    const urlOk = isValidHttpUrl(turl);
    setErrName(nameOk ? "" : t("ext.err.nameUrl"));
    setErrTpl(urlOk ? "" : t("ext.err.nameUrl"));
    if (!nameOk || !urlOk) return;
    if (sites.some((s) => s.template === turl)) return;
    setSites([{ name: n, template: turl }, ...sites]);
    setName("");
    setTpl("");
    setErrName("");
    setErrTpl("");
  }
  function remove(i: number) {
    setSites(sites.filter((_, idx) => idx !== i));
  }
  function openSite(tplStr: string) {
    if (!currentQuery.trim()) return;
    const url = buildUrl(tplStr, currentQuery);
    window.open(url, "_blank", "noopener,noreferrer");
  }
  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  }

  const disabled = !name.trim() || !isValidHttpUrl(tpl.trim());

  const list = useMemo(() => {
    return sites.map((s) => {
      const preview = currentQuery.trim() ? buildUrl(s.template, currentQuery) : "";
      return { ...s, preview };
    });
  }, [sites, currentQuery]);

  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold mb-1.5">{t("ext.title")}</h2>
      <p className="text-sm text-muted mb-3">{t("ext.subtitle", { query: "{query}", plus: "{plus}", raw: "{raw}" })}</p>

      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errName) setErrName("");
            }}
            onBlur={() => {
              if (!name.trim()) setErrName(t("ext.err.nameUrl"));
            }}
            placeholder={t("ext.namePh")}
            aria-invalid={!!errName}
            aria-describedby={errName ? "ext-name-err" : undefined}
            className={`field ${errName ? "border-red-500 focus-visible:outline-red-500" : ""}`}
          />
          {errName ? (
            <p id="ext-name-err" className="mt-1 text-xs text-red-600">{errName}</p>
          ) : null}
        </div>

        <div>
          <input
            value={tpl}
            onChange={(e) => {
              setTpl(e.target.value);
              if (errTpl) setErrTpl("");
            }}
            onBlur={() => {
              if (!isValidHttpUrl(tpl.trim())) setErrTpl(t("ext.err.nameUrl"));
            }}
            placeholder={t("ext.urlPh")}
            aria-invalid={!!errTpl}
            aria-describedby={errTpl ? "ext-url-err" : undefined}
            className={`field ${errTpl ? "border-red-500 focus-visible:outline-red-500" : ""}`}
          />
          {errTpl ? (
            <p id="ext-url-err" className="mt-1 text-xs text-red-600">{errTpl}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-2">
        <button onClick={add} disabled={disabled} className={`btn-primary btn-sm ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
          {t("ext.add")}
        </button>
      </div>

      {list.length ? (
        <ul className="mt-4 grid gap-2">
          {list.map((s, i) => (
            <li key={`${s.template}:${i}`} className="card flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="text-sm min-w-0">
                <span className="font-medium">{s.name}</span> —{" "}
                <code className="text-xs break-all">{s.template}</code>
                {s.preview ? (
                  <div className="mt-1 text-xs text-muted">
                    {t("ext.preview")}{" "}
                    <a href={s.preview} target="_blank" rel="noopener noreferrer" className="underline">
                      {s.preview}
                    </a>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.preview ? (
                  <>
                    <button onClick={() => openSite(s.template)} className="btn-ghost btn-sm">
                      {t("ext.open", { q: currentQuery })}
                    </button>
                    <button onClick={() => copy(s.preview)} className="btn btn-sm">
                      {t("ext.copy")}
                    </button>
                  </>
                ) : null}
                <button onClick={() => remove(i)} className="btn btn-sm">
                  {t("common.remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted mt-3">{t("ext.none")}</p>
      )}
    </section>
  );
}
