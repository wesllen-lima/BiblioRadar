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
  return `${tpl}${tpl.includes("?") ? "&" : "?"}q=${enc}`;
}

export default function ExternalQuick({
  currentQuery,
  onManageClick,
}: {
  currentQuery: string;
  onManageClick?: () => void;
}) {
  const { t } = useI18n();
  const [sites, setSites] = useState<ExternalSite[]>([]);

  useEffect(() => {
    try { setSites(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); } catch {}
    const onStorage = () => {
      try { setSites(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const buttons = useMemo(() => {
    if (!currentQuery.trim()) return [];
    return sites.slice(0, 8).map((s) => ({
      name: s.name,
      href: buildUrl(s.template, currentQuery),
    }));
  }, [sites, currentQuery]);

  if (!sites.length) {
    return (
      <div className="text-sm text-muted">
        {t("ext.quick.none")}{" "}
        <button className="underline" onClick={onManageClick}>{t("ext.quick.add")}</button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{t("ext.quick.title")}</div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {buttons.length ? buttons.map((b, i) => (
          <a
            key={i}
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm border border-soft rounded-full bg-surface hover:bg-app transition whitespace-nowrap"
            title={t("ext.openIn", { name: b.name })}
          >
            {b.name}
          </a>
        )) : (
          <div className="text-xs text-muted">
            {t("ext.quick.typeToEnable")}
          </div>
        )}
      </div>

      <div>
        <button className="text-xs underline" onClick={onManageClick}>
          {t("ext.quick.manage")}
        </button>
      </div>
    </div>
  );
}
