"use client";

import { useI18n } from "@/components/I18nProvider";
import { Globe } from "lucide-react";

export default function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  const toggle = () => {
    const next = locale === "pt-BR" ? "en" : "pt-BR";
    setLocale(next);
  };

  return (
    <button
      onClick={toggle}
      className="group relative flex h-9 min-w-[60px] items-center justify-center gap-1.5 rounded-full border border-transparent bg-transparent px-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
      title="Mudar Idioma"
    >
      <Globe size={14} className="transition-transform duration-500 group-hover:rotate-180" />
      
      <div className="relative h-4 w-4 overflow-hidden">
        <div 
          className={`absolute flex flex-col transition-transform duration-300 ease-spring ${
            locale === "pt-BR" ? "-translate-y-0" : "-translate-y-4"
          }`}
        >
          <span className="h-4 flex items-center justify-center">PT</span>
          <span className="h-4 flex items-center justify-center">EN</span>
        </div>
      </div>
    </button>
  );
}