"use client";

import { useLibrary } from "@/lib/useLibrary";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, BookHeart, Search, Heart } from "lucide-react";
import { useI18n } from "@/components/I18nProvider"; // Importar i18n

export default function LibraryPage() {
  const { items, isLoaded } = useLibrary();
  const { t } = useI18n(); // Usar hook
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  if (!mounted || !isLoaded) {
    return (
      <div className="py-12 space-y-4 max-w-2xl mx-auto px-4">
        <div className="h-8 w-48 bg-shimmer rounded animate-pulse"></div>
        <div className="h-32 w-full bg-shimmer rounded animate-pulse"></div>
      </div>
    );
  }

  const countLabel = items.length === 1 ? t("library.count_one") : t("library.count_other");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-foreground">
            <BookHeart className="text-primary" size={32} />
            {t("library.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 ml-1">
            {items.length} {countLabel}.
          </p>
        </div>
        <Link 
          href={"/" as any} 
          className="btn-ghost h-9 gap-2 px-3 text-muted-foreground hover:text-foreground self-start sm:self-auto"
        >
          <ArrowLeft size={16} />
          <span>{t("library.back")}</span>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-muted/10">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 text-muted-foreground shadow-sm">
            <BookHeart size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-medium mb-2 text-foreground">{t("library.empty")}</h2>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
            {t("library.emptyDesc")} <Heart size={14} className="inline text-red-500 fill-red-500 mx-1"/>
          </p>
          <Link href={"/" as any} className="btn-primary gap-2">
            <Search size={16} />
            {t("search.placeholder").split("(")[0]}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {items.map((book) => (
            <div key={book.id} className="h-full">
               <BookCard book={book} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}