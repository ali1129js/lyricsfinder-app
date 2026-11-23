import { useCallback, useState } from "react";
import { z } from "zod";
import { readStored, writeStored } from "../lib/storage";

export const RECENT_KEY = "lyricsfinder.v2.recent";
export const MAX_RECENT = 6;

const recentSchema = z.array(z.string().trim().min(1).max(120)).max(50);

/** Most recent first, no duplicates (case-insensitive), at most MAX_RECENT. */
export function addRecent(list: readonly string[], query: string): string[] {
  const q = query.trim().replace(/\s+/g, " ");
  if (!q) return [...list];
  const rest = list.filter((x) => x.toLowerCase() !== q.toLowerCase());
  return [q, ...rest].slice(0, MAX_RECENT);
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(() =>
    readStored(RECENT_KEY, recentSchema, []).slice(0, MAX_RECENT),
  );

  const save = useCallback((next: string[]) => {
    writeStored(RECENT_KEY, next);
    setRecent(next);
  }, []);

  const add = useCallback(
    (q: string) =>
      setRecent((prev) => {
        const next = addRecent(prev, q);
        writeStored(RECENT_KEY, next);
        return next;
      }),
    [],
  );
  const remove = useCallback(
    (q: string) =>
      setRecent((prev) => {
        const next = prev.filter((x) => x !== q);
        writeStored(RECENT_KEY, next);
        return next;
      }),
    [],
  );
  const clear = useCallback(() => save([]), [save]);

  return { recent, add, remove, clear };
}
