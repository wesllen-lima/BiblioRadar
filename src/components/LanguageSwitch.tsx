"use client";
import { LOCALES, type Locale } from "@/lib/i18n";
import { useI18n } from "@/components/I18nProvider";

export default function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="toolbar">
      <span className="text-sm">🌐</span>
      <div className="flex gap-1">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc as Locale)}
            className={`btn-sm ${locale === loc ? "btn-primary" : "btn-ghost"}`}
            aria-pressed={locale === loc}
            title={loc}
          >
            {loc === "pt-BR" ? "PT-BR" : "EN"}
          </button>
        ))}
      </div>
    </div>
  );
}
