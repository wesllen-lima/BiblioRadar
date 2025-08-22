"use client";

import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useI18n } from "@/components/I18nProvider";

export default function HeaderNav() {
  const { t } = useI18n();

  return (
    <header className="mx-auto max-w-6xl px-4 md:px-6 py-2">
      <nav className="nav-pill">
        <div className="brand-chip">
          <span className="brand-dot" aria-hidden />
          <span className="brand-title">{t("brand.name")}</span>
        </div>
        <div className="nav-actions gap-2">
          <button type="button" className="search-chip" title="Ctrl + K">
            <span className="hidden sm:inline">{t("nav.search")}</span>
            <kbd>Ctrl</kbd><span className="opacity-70">+</span><kbd>K</kbd>
          </button>
          <a href="#providers-manager" className="btn-primary btn-sm">
            {t("nav.addProvider")}
          </a>
          <LanguageSwitch />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
