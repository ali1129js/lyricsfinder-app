import type { Track } from "../api/lrclib";

export interface SyncedLine {
  /** Seconds from the start of the track. */
  time: number;
  text: string;
}

export type LyricsView =
  | { kind: "instrumental" }
  | { kind: "empty" }
  | { kind: "plain"; text: string }
  | { kind: "synced"; text: string; lines: SyncedLine[] };

const STAMP = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
const LEADING_STAMPS = /^(\s*\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\])+\s?/;

/** Strip [mm:ss.xx] stamps so synced lyrics still read as plain text. */
export function stripTimestamps(synced: string): string {
  return synced
    .split(/\r?\n/)
    .filter((l) => !/^\s*\[[a-z]+:.*\]\s*$/i.test(l))
    .map((l) => l.replace(LEADING_STAMPS, ""))
    .join("\n")
    .trim();
}

/**
 * Parse LRC text. A line may carry several stamps ("[00:10.00][01:20.00]Chorus").
 * Tag lines such as [ar:Artist] are skipped, and [offset:+250] (milliseconds) is applied.
 */
export function parseLrc(lrc: string): SyncedLine[] {
  let offset = 0;
  const lines: SyncedLine[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const off = /^\s*\[offset:\s*([+-]?\d+)\s*\]/i.exec(raw);
    if (off?.[1]) {
      offset = Number(off[1]) / 1000;
      continue;
    }
    const lead = LEADING_STAMPS.exec(raw);
    if (!lead) continue;
    const text = raw.slice(lead[0].length).trim();
    for (const m of lead[0].matchAll(STAMP)) {
      const frac = m[3] ? Number(m[3]) / 10 ** m[3].length : 0;
      const time = Number(m[1]) * 60 + Number(m[2]) + frac;
      lines.push({ time, text });
    }
  }
  return lines
    .map((l) => ({ ...l, time: Math.max(0, l.time - offset) }))
    .sort((a, b) => a.time - b.time);
}

/** Index of the line being sung at `t` seconds, or -1 before the first line. */
export function activeLineIndex(lines: readonly SyncedLine[], t: number): number {
  let lo = 0;
  let hi = lines.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if ((lines[mid]?.time ?? Infinity) <= t) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
}

export function lyricsView(track: Track): LyricsView {
  if (track.instrumental) return { kind: "instrumental" };
  const plain = track.plainLyrics?.trim() ?? "";
  const lines = track.syncedLyrics ? parseLrc(track.syncedLyrics) : [];
  if (lines.some((l) => l.text)) {
    return { kind: "synced", lines, text: plain || stripTimestamps(track.syncedLyrics ?? "") };
  }
  if (plain) return { kind: "plain", text: plain };
  return { kind: "empty" };
}
