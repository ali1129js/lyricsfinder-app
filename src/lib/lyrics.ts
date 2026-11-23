import type { Track } from "../api/lrclib";

export type LyricsView =
  { kind: "instrumental" } | { kind: "empty" } | { kind: "plain"; text: string };

/** Strip [mm:ss.xx] stamps so synced-only tracks still have readable text. */
export function stripTimestamps(synced: string): string {
  return synced
    .split(/\r?\n/)
    .map((l) => l.replace(/^(\s*\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\])+\s?/, ""))
    .join("\n")
    .trim();
}

export function lyricsView(track: Track): LyricsView {
  if (track.instrumental) return { kind: "instrumental" };
  const plain = track.plainLyrics?.trim();
  if (plain) return { kind: "plain", text: plain };
  const fromSynced = track.syncedLyrics ? stripTimestamps(track.syncedLyrics) : "";
  if (fromSynced) return { kind: "plain", text: fromSynced };
  return { kind: "empty" };
}
