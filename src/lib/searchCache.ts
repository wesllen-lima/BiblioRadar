export type CacheRecord<T> = { ts: number; data: T };

const NS = "br_cache_v1:";
const DEFAULT_TTL = 5 * 60 * 1000;

function now() {
  return Date.now();
}

export function getCache<T>(key: string, ttlMs = DEFAULT_TTL): T | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(NS + key);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as CacheRecord<T>;
    if (!obj || typeof obj.ts !== "number") return null;
    if (now() - obj.ts > ttlMs) return null;
    return obj.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  if (typeof sessionStorage === "undefined") return;
  const rec: CacheRecord<T> = { ts: now(), data };
  try {
    sessionStorage.setItem(NS + key, JSON.stringify(rec));
  } catch {}
}

export function makeKey(parts: string[]): string {
  return parts.join("|");
}
