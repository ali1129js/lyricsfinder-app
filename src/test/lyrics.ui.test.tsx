import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import { fakeFetch, jsonResponse, track } from "./fakeFetch";
import type { Track } from "../api/lrclib";

function go(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}

function renderTrack(t: Track | null, status = 200) {
  const f = fakeFetch(() => jsonResponse(t ?? { name: "TrackNotFound" }, status));
  window.location.hash = `#/track/${t?.id ?? 99}`;
  render(<App fetchImpl={f} />);
  return f;
}

afterEach(() => {
  vi.restoreAllMocks();
  window.location.hash = "";
});

describe("lyrics page", () => {
  it("opens a result from the list without a second request", async () => {
    const f = fakeFetch(() => jsonResponse([track({ id: 5, trackName: "Open Me" })]));
    render(<App fetchImpl={f} />);
    await userEvent.type(screen.getByLabelText("Song or artist"), "open{Enter}");
    const link = await screen.findByRole("link", { name: /Open Me/ });
    expect(link).toHaveAttribute("href", "#/track/5");
    go("#/track/5");
    expect(await screen.findByRole("heading", { name: "Open Me" })).toHaveFocus();
    expect(screen.getByText(/First line/)).toBeInTheDocument();
    expect(f.calls).toHaveLength(1);
  });

  it("loads a deep link by id", async () => {
    const f = renderTrack(track({ id: 12, trackName: "Deep Link" }));
    expect(await screen.findByRole("heading", { name: "Deep Link" })).toBeInTheDocument();
    expect(f.calls[0]).toBe("https://lrclib.net/api/get/12");
  });

  it("explains instrumental tracks and hides copy", async () => {
    renderTrack(track({ instrumental: true, plainLyrics: null }));
    expect(await screen.findByText(/instrumental, so there are no lyrics/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Copy/ })).not.toBeInTheDocument();
  });

  it("explains a track without lyrics", async () => {
    renderTrack(track({ plainLyrics: null, syncedLyrics: null }));
    expect(await screen.findByText(/no lyrics for it yet/)).toBeInTheDocument();
  });

  it("shows not found for an unknown id", async () => {
    renderTrack(null, 404);
    expect(await screen.findByRole("alert")).toHaveTextContent(/No songs matched/);
  });

  it("copies and announces it", async () => {
    const user = userEvent.setup();
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderTrack(track());
    await user.click(await screen.findByRole("button", { name: "Copy lyrics" }));
    expect(write).toHaveBeenCalledWith("First line\nSecond line");
    expect(await screen.findByText("Lyrics copied to the clipboard.")).toBeInTheDocument();
  });

  it("announces a failed copy instead of failing silently", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    renderTrack(track());
    await user.click(await screen.findByRole("button", { name: "Copy lyrics" }));
    expect(await screen.findByText(/Copy did not work/)).toBeInTheDocument();
  });
});
