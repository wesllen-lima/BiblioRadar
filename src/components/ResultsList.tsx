"use client";

import { useState } from "react";
import type { BookResult } from "@/lib/types";
import BookCard from "@/components/BookCard";
import { useI18n } from "@/components/I18nProvider";

export default function ResultsList({
  items,
  pageSize = 4,
}: {
  items: BookResult[];
  pageSize?: number;
}) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const visible = items.slice(0, page * pageSize);
  const hasMore = visible.length < items.length;

  return (
    <div className="space-y-2.5">
      <div className="grid gap-2.5">
        {visible.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>

      {hasMore ? (
        <div className="flex justify-center">
          <button
            className="btn-ghost"
            onClick={() => setPage((p) => p + 1)}
            aria-label={t("results.loadMore")}
          >
            {t("results.loadMore")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
