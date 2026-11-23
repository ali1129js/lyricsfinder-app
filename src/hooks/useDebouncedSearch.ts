import { useCallback, useEffect, useState } from "react";

export const MIN_AUTO_CHARS = 2;

/**
 * Owns the search box text. Typing searches after a pause; submit and
 * picking a recent search run at once and cancel the pending timer.
 */
export function useDebouncedSearch(
  search: (q: string) => void,
  clear: () => void,
  debounceMs = 350,
) {
  const [input, setInput] = useState("");
  const [typed, setTyped] = useState<string | null>(null);

  useEffect(() => {
    if (typed === null) return;
    const q = typed.trim();
    if (q.length === 0) {
      clear();
      return;
    }
    if (q.length < MIN_AUTO_CHARS) return;
    const t = window.setTimeout(() => search(q), debounceMs);
    return () => window.clearTimeout(t);
  }, [typed, debounceMs, search, clear]);

  const onType = useCallback((v: string) => {
    setInput(v);
    setTyped(v);
  }, []);

  const runNow = useCallback(
    (q: string) => {
      setTyped(null);
      setInput(q);
      search(q);
    },
    [search],
  );

  return { input, onType, runNow };
}
