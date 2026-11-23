import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError, searchTracks } from "../api/lrclib";
import type { FetchLike, LyricsError, Track } from "../api/lrclib";

export type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "done"; query: string; tracks: Track[] }
  | { status: "error"; query: string; error: LyricsError };

/**
 * Runs one search at a time. Starting a new search aborts the one in flight,
 * so a slow old answer can never overwrite a newer one.
 */
export function useTrackSearch(fetchImpl?: FetchLike) {
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const search = useCallback(
    async (query: string) => {
      controller.current?.abort();
      const ctrl = new AbortController();
      controller.current = ctrl;
      setState({ status: "loading", query });
      try {
        const res = await searchTracks(query, ctrl.signal, fetchImpl);
        if (ctrl.signal.aborted) return;
        setState(
          res.ok
            ? { status: "done", query, tracks: res.value }
            : { status: "error", query, error: res.error },
        );
      } catch (e) {
        if (isAbortError(e) || ctrl.signal.aborted) return;
        setState({ status: "error", query, error: { kind: "network" } });
      }
    },
    [fetchImpl],
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, search, reset };
}
