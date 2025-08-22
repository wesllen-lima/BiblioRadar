"use client";

export default function SkeletonCard() {
  return (
    <article aria-hidden className="card grid grid-cols-[84px_1fr] gap-3 p-3 md:p-4 animate-rise">
      <div className="w-[84px] h-[112px] rounded-md border border-soft overflow-hidden">
        <div className="w-full h-full bg-shimmer" />
      </div>

      <div className="min-w-0 space-y-2">
        <div className="h-4 rounded bg-shimmer w-3/4" />
        <div className="h-3 rounded bg-shimmer w-1/2" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 rounded bg-shimmer w-28" />
          <div className="h-8 rounded bg-shimmer w-24" />
        </div>
      </div>
    </article>
  );
}
