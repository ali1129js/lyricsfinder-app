import { describe, expect, it } from "vitest";
import { lyricsView, stripTimestamps } from "./lyrics";
import { track } from "../test/fakeFetch";
import { parseHash } from "../hooks/useHashRoute";

describe("lyricsView", () => {
  it("shows plain lyrics", () => {
    expect(lyricsView(track())).toEqual({ kind: "plain", text: "First line\nSecond line" });
  });
  it("marks instrumental tracks", () => {
    expect(lyricsView(track({ instrumental: true, plainLyrics: null }))).toEqual({
      kind: "instrumental",
    });
  });
  it("marks tracks with no lyrics as empty", () => {
    expect(lyricsView(track({ plainLyrics: "  ", syncedLyrics: null }))).toEqual({ kind: "empty" });
  });
  it("falls back to synced lyrics without stamps", () => {
    expect(
      lyricsView(track({ plainLyrics: null, syncedLyrics: "[00:01.20] One\n[00:03.00] Two" })),
    ).toEqual({ kind: "plain", text: "One\nTwo" });
  });
  it("strips repeated stamps", () => {
    expect(stripTimestamps("[00:01.00][01:10.50] Chorus")).toBe("Chorus");
  });
});

describe("parseHash", () => {
  it("reads track routes and falls back to search", () => {
    expect(parseHash("#/track/42")).toEqual({ page: "track", id: 42 });
    expect(parseHash("#/track/abc")).toEqual({ page: "search" });
    expect(parseHash("")).toEqual({ page: "search" });
  });
});
