"use client";

import { useState } from "react";
import type { BookResult } from "@/lib/types";
import BookCard from "@/components/BookCard";
import { useI18n } from "@/components/I18nProvider";
import { ArrowDown } from "lucide-react";

export default function ResultsList({
  items,
  pageSize = 8,
}: {
  items: BookResult[];
  pageSize?: number;
}) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  
  const visible = items.slice(0, page * pageSize);
  const hasMore = visible.length < items.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* GRID RESPONSIVO:
         - Mobile (padrão): 1 coluna (cards largos)
         - Tablet/Desktop (md): 2 colunas (melhor aproveitamento de espaço)
         - gap-6: Espaçamento generoso entre os cards
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {visible.map((b) => (
          <div key={b.id} className="h-full">
            <BookCard book={b} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            className="btn-ghost gap-2 h-10 px-6 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-95"
            onClick={() => setPage((p) => p + 1)}
            aria-label={t("results.loadMore")}
          >
            <ArrowDown size={16} />
            {t("results.loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}