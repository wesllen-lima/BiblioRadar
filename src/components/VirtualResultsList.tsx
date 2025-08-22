"use client";

import { Virtuoso } from "react-virtuoso";
import type { BookResult } from "@/lib/types";
import BookCard from "@/components/BookCard";

export default function VirtualResultsList({
  items,
}: {
  items: BookResult[];
}) {
  return (
    <div>
      <Virtuoso
        data={items}
        useWindowScroll
        overscan={200}
        itemContent={(_, item) => <BookCard book={item} />}
      />
    </div>
  );
}
