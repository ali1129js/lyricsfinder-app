import { z } from "zod";

export const API_BASE = "https://lrclib.net/api";

/** lrclib asks clients to identify themselves. It allows this header in CORS. */
const CLIENT_HEADER = {
  "Lrclib-Client": "lyricsfinder-app (github.com/ali1129js/lyricsfinder-app)",
};

export const trackSchema = z.object({
  id: z.number(),
  trackName: z.string(),
  artistName: z.string(),
  albumName: z.string().nullable().catch(null),
  duration: z.number().nullable().catch(null),
  instrumental: z.boolean().catch(false),
  plainLyrics: z.string().nullable().catch(null),
  syncedLyrics: z.string().nullable().catch(null),
});
export type Track = z.infer<typeof trackSchema>;

const searchResponseSchema = z.array(z.unknown());

/** Every way a lookup can go wrong, so the UI can say something useful for each. */
export type LyricsError =
  | { kind: "empty-query" }
  | { kind: "not-found" }
  | { kind: "network" }
  | { kind: "http"; status: number }
  | { kind: "bad-response" };

export type Result<T> = { ok: true; value: T } | { ok: false; error: LyricsError };

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

async function getJson(
  url: string,
  signal: AbortSignal | undefined,
  fetchImpl: FetchLike,
): Promise<Result<unknown>> {
  let res: Response;
  try {
    res = await fetchImpl(url, { signal: signal ?? null, headers: CLIENT_HEADER });
  } catch (e) {
    if (isAbortError(e)) throw e;
    return { ok: false, error: { kind: "network" } };
  }
  if (res.status === 404) return { ok: false, error: { kind: "not-found" } };
  if (!res.ok) return { ok: false, error: { kind: "http", status: res.status } };
  try {
    return { ok: true, value: await res.json() };
  } catch (e) {
    if (isAbortError(e)) throw e;
    return { ok: false, error: { kind: "bad-response" } };
  }
}

/**
 * Search lrclib by free text. Rows that do not match the schema are dropped
 * rather than failing the whole list. Aborts propagate as AbortError so the
 * caller can ignore them.
 */
export async function searchTracks(
  query: string,
  signal?: AbortSignal,
  fetchImpl: FetchLike = fetch,
): Promise<Result<Track[]>> {
  const q = query.trim();
  if (!q) return { ok: false, error: { kind: "empty-query" } };
  const res = await getJson(`${API_BASE}/search?q=${encodeURIComponent(q)}`, signal, fetchImpl);
  if (!res.ok) return res;
  const list = searchResponseSchema.safeParse(res.value);
  if (!list.success) return { ok: false, error: { kind: "bad-response" } };
  const tracks = list.data.flatMap((row) => {
    const t = trackSchema.safeParse(row);
    return t.success ? [t.data] : [];
  });
  if (tracks.length === 0) return { ok: false, error: { kind: "not-found" } };
  return { ok: true, value: tracks };
}

/** Load one track (with lyrics) by its lrclib id. */
export async function getTrack(
  id: number,
  signal?: AbortSignal,
  fetchImpl: FetchLike = fetch,
): Promise<Result<Track>> {
  const res = await getJson(`${API_BASE}/get/${id}`, signal, fetchImpl);
  if (!res.ok) return res;
  const t = trackSchema.safeParse(res.value);
  return t.success ? { ok: true, value: t.data } : { ok: false, error: { kind: "bad-response" } };
}

export function errorMessage(error: LyricsError): string {
  switch (error.kind) {
    case "empty-query":
      return "Type a song title or artist first.";
    case "not-found":
      return "No songs matched. Check the spelling or try fewer words.";
    case "network":
      return "Could not reach lrclib.net. Check your connection and try again.";
    case "http":
      return `lrclib.net answered with an error (${error.status}). Try again in a moment.`;
    case "bad-response":
      return "lrclib.net sent data this app could not read.";
  }
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
