import { useEffect, useState } from "react";
import { getTrack, isAbortError } from "../api/lrclib";
import type { FetchLike, LyricsError, Track } from "../api/lrclib";

export type TrackState =
  | { status: "loading" }
  | { status: "done"; track: Track }
  | { status: "error"; error: LyricsError };

/** Uses the copy from the search results when there is one, otherwise loads by id. */
export function useTrack(id: number, known: Track | undefined, fetchImpl?: FetchLike): TrackState {
  const [state, setState] = useState<TrackState>(
    known ? { status: "done", track: known } : { status: "loading" },
  );

  useEffect(() => {
    if (known) {
      setState({ status: "done", track: known });
      return;
    }
    const ctrl = new AbortController();
    setState({ status: "loading" });
    getTrack(id, ctrl.signal, fetchImpl).then(
      (res) => {
        if (ctrl.signal.aborted) return;
        setState(
          res.ok ? { status: "done", track: res.value } : { status: "error", error: res.error },
        );
      },
      (e: unknown) => {
        if (isAbortError(e) || ctrl.signal.aborted) return;
        setState({ status: "error", error: { kind: "network" } });
      },
    );
    return () => ctrl.abort();
  }, [id, known, fetchImpl]);

  return state;
}
