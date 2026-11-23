import type { FetchLike, Track } from "../api/lrclib";

export function track(over: Partial<Track> = {}): Track {
  return {
    id: 1,
    trackName: "Demo Song",
    artistName: "Demo Band",
    albumName: "Demo Album",
    duration: 185,
    instrumental: false,
    plainLyrics: "First line\nSecond line",
    syncedLyrics: null,
    ...over,
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** A fetch that answers from a function, and rejects with AbortError when aborted. */
export function fakeFetch(answer: (url: string) => Response | Promise<Response>): FetchLike & {
  calls: string[];
} {
  const calls: string[] = [];
  const f = (url: string, init?: RequestInit) => {
    calls.push(url);
    return new Promise<Response>((resolve, reject) => {
      const signal = init?.signal;
      if (signal?.aborted) return reject(new DOMException("aborted", "AbortError"));
      signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      Promise.resolve(answer(url)).then(resolve, reject);
    });
  };
  return Object.assign(f, { calls });
}
