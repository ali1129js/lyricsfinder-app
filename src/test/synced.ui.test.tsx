import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { App } from "../App";
import { fakeFetch, jsonResponse, track } from "./fakeFetch";
import type { Track } from "../api/lrclib";

const SYNCED = "[00:01.00]Line one\n[00:03.00]Line two\n[00:05.00]Line three";

async function showTrack(t: Track) {
  window.location.hash = `#/track/${t.id}`;
  render(<App fetchImpl={fakeFetch(() => jsonResponse(t))} />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

function activeText() {
  return document.querySelector('[aria-current="true"]')?.textContent ?? null;
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }));
afterEach(() => vi.useRealTimers());

describe("synced lyrics", () => {
  it("highlights the current line while the clock runs and pauses", async () => {
    await showTrack(track({ syncedLyrics: SYNCED, duration: 10 }));
    expect(screen.getByRole("list", { name: "Timed lyrics" })).toBeInTheDocument();
    expect(activeText()).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Play along" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(activeText()).toBe("Line one");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(activeText()).toBe("Line two");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(activeText()).toBe("Line two");
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
  });

  it("jumps with the position slider", async () => {
    await showTrack(track({ syncedLyrics: SYNCED, duration: 10 }));
    fireEvent.change(screen.getByLabelText("Position"), { target: { value: "5.5" } });
    expect(activeText()).toBe("Line three");
  });

  it("shows plain lyrics without a player when there are no timed lines", async () => {
    await showTrack(track());
    expect(screen.getByText(/First line/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play along" })).not.toBeInTheDocument();
  });

  it("shows the instrumental message without a player", async () => {
    await showTrack(track({ instrumental: true, plainLyrics: null, syncedLyrics: "[00:01.00]x" }));
    expect(screen.getByText(/instrumental/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play along" })).not.toBeInTheDocument();
  });
});
