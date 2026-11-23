import { describe, expect, it } from "vitest";
import { errorMessage, formatDuration, getTrack, searchTracks } from "./lrclib";
import { fakeFetch, jsonResponse, track } from "../test/fakeFetch";

describe("searchTracks", () => {
  it("rejects an empty query without calling the API", async () => {
    const f = fakeFetch(() => jsonResponse([]));
    expect(await searchTracks("   ", undefined, f)).toEqual({
      ok: false,
      error: { kind: "empty-query" },
    });
    expect(f.calls).toHaveLength(0);
  });

  it("encodes the query and returns parsed tracks", async () => {
    const f = fakeFetch(() => jsonResponse([track(), track({ id: 2 })]));
    const res = await searchTracks(" AC/DC & friends ", undefined, f);
    expect(f.calls[0]).toBe("https://lrclib.net/api/search?q=AC%2FDC%20%26%20friends");
    expect(res.ok && res.value.map((t) => t.id)).toEqual([1, 2]);
  });

  it("treats an empty list as not found", async () => {
    const f = fakeFetch(() => jsonResponse([]));
    expect(await searchTracks("zzz", undefined, f)).toEqual({
      ok: false,
      error: { kind: "not-found" },
    });
  });

  it("drops rows that do not match the schema", async () => {
    const f = fakeFetch(() => jsonResponse([{ id: "x" }, track({ id: 7 })]));
    const res = await searchTracks("demo", undefined, f);
    expect(res.ok && res.value.map((t) => t.id)).toEqual([7]);
  });

  it("reports a network failure", async () => {
    const f = fakeFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    expect(await searchTracks("demo", undefined, f)).toEqual({
      ok: false,
      error: { kind: "network" },
    });
  });

  it("reports an HTTP error with its status", async () => {
    const f = fakeFetch(() => jsonResponse({}, 503));
    expect(await searchTracks("demo", undefined, f)).toEqual({
      ok: false,
      error: { kind: "http", status: 503 },
    });
  });

  it("reports a body that is not a list", async () => {
    const f = fakeFetch(() => jsonResponse({ message: "nope" }));
    expect(await searchTracks("demo", undefined, f)).toEqual({
      ok: false,
      error: { kind: "bad-response" },
    });
  });

  it("lets an abort through as AbortError", async () => {
    const ctrl = new AbortController();
    const f = fakeFetch(() => new Promise<Response>(() => undefined));
    const p = searchTracks("demo", ctrl.signal, f);
    ctrl.abort();
    await expect(p).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("getTrack", () => {
  it("maps 404 to not found", async () => {
    const f = fakeFetch(() => jsonResponse({ name: "TrackNotFound" }, 404));
    expect(await getTrack(9, undefined, f)).toEqual({ ok: false, error: { kind: "not-found" } });
    expect(f.calls[0]).toBe("https://lrclib.net/api/get/9");
  });
});

describe("helpers", () => {
  it("has a message for every error kind", () => {
    for (const e of [
      { kind: "empty-query" },
      { kind: "not-found" },
      { kind: "network" },
      { kind: "http", status: 500 },
      { kind: "bad-response" },
    ] as const)
      expect(errorMessage(e).length).toBeGreaterThan(10);
  });

  it("formats durations", () => {
    expect(formatDuration(185.4)).toBe("3:05");
    expect(formatDuration(null)).toBe("");
  });
});
