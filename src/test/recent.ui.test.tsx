import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import { fakeFetch, jsonResponse, track } from "./fakeFetch";

const KEY = "lyricsfinder.v2.recent";

function setup() {
  const f = fakeFetch((url) =>
    jsonResponse([track({ trackName: `Song for ${new URL(url).searchParams.get("q")}` })]),
  );
  const utils = render(<App fetchImpl={f} />);
  return { f, ...utils };
}

describe("recent searches", () => {
  it("saves successful searches and keeps them after a reload", async () => {
    const { unmount } = setup();
    await userEvent.type(screen.getByLabelText("Song or artist"), "queen{Enter}");
    await screen.findByText("Song for queen");
    expect(JSON.parse(localStorage.getItem(KEY) ?? "[]")).toEqual(["queen"]);
    unmount();
    setup();
    const nav = screen.getByRole("navigation", { name: "Recent" });
    expect(within(nav).getByRole("button", { name: "queen" })).toBeInTheDocument();
  });

  it("runs a recent search from the keyboard", async () => {
    localStorage.setItem(KEY, JSON.stringify(["abba", "queen"]));
    const { f } = setup();
    const chip = screen.getByRole("button", { name: "abba" });
    chip.focus();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByText("Song for abba")).toBeInTheDocument();
    expect(screen.getByLabelText("Song or artist")).toHaveValue("abba");
    expect(f.calls).toHaveLength(1);
  });

  it("removes one entry and clears all", async () => {
    localStorage.setItem(KEY, JSON.stringify(["abba", "queen", "muse"]));
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Remove “queen” from recent searches" }),
    );
    expect(JSON.parse(localStorage.getItem(KEY) ?? "[]")).toEqual(["abba", "muse"]);
    await userEvent.click(screen.getByRole("button", { name: "Clear history" }));
    expect(localStorage.getItem(KEY)).toBe("[]");
    expect(screen.queryByRole("navigation", { name: "Recent" })).not.toBeInTheDocument();
  });

  it("ignores a corrupted history", () => {
    localStorage.setItem(KEY, '{"not":"a list"}');
    setup();
    expect(screen.queryByRole("navigation", { name: "Recent" })).not.toBeInTheDocument();
  });
});

describe("compact list", () => {
  it("switches density and remembers it", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Song or artist"), "muse{Enter}");
    await screen.findByText("Song for muse");
    await userEvent.click(screen.getByRole("button", { name: "Compact" }));
    expect(screen.getByRole("list", { name: /1 result for/ }).className).toContain("compact");
    expect(localStorage.getItem("lyricsfinder.v2.density")).toBe('"compact"');
  });
});
