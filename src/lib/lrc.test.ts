import { describe, expect, it } from "vitest";
import { activeLineIndex, lyricsView, parseLrc } from "./lyrics";
import { track } from "../test/fakeFetch";

describe("parseLrc", () => {
  it("reads stamps with centiseconds and milliseconds", () => {
    expect(parseLrc("[00:01.50] One\n[01:02.250] Two")).toEqual([
      { time: 1.5, text: "One" },
      { time: 62.25, text: "Two" },
    ]);
  });
  it("expands lines with several stamps and sorts them", () => {
    expect(parseLrc("[00:30.00][00:10.00]Chorus\n[00:20.00]Verse").map((l) => l.time)).toEqual([
      10, 20, 30,
    ]);
  });
  it("skips tags and applies the offset", () => {
    expect(parseLrc("[ar:Someone]\n[offset:+500]\n[00:02.00]Hi")).toEqual([
      { time: 1.5, text: "Hi" },
    ]);
  });
  it("keeps empty timed lines as breaks", () => {
    expect(parseLrc("[00:05.00]")).toEqual([{ time: 5, text: "" }]);
  });
});

describe("activeLineIndex", () => {
  const lines = parseLrc("[00:01.00]A\n[00:03.00]B\n[00:06.00]C");
  it.each([
    [0, -1],
    [1, 0],
    [2.9, 0],
    [3, 1],
    [100, 2],
  ])("at %s s the active line is %s", (t, want) => {
    expect(activeLineIndex(lines, t)).toBe(want);
  });
});

describe("lyricsView with synced lyrics", () => {
  it("prefers synced lines and copies the plain text", () => {
    const v = lyricsView(track({ syncedLyrics: "[00:01.00]First line" }));
    expect(v.kind).toBe("synced");
    expect(v.kind === "synced" && v.text).toBe("First line\nSecond line");
  });
  it("uses the stripped synced text when plain is missing", () => {
    const v = lyricsView(
      track({ plainLyrics: null, syncedLyrics: "[00:01.00]Only\n[00:02.00]Synced" }),
    );
    expect(v.kind === "synced" && v.text).toBe("Only\nSynced");
  });
  it("stays plain when the synced field has no real lines", () => {
    expect(lyricsView(track({ syncedLyrics: "[ar:x]" })).kind).toBe("plain");
  });
  it("keeps instrumental first", () => {
    expect(lyricsView(track({ instrumental: true, syncedLyrics: "[00:01.00]x" })).kind).toBe(
      "instrumental",
    );
  });
});
