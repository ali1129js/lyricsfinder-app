import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import { fakeFetch, jsonResponse } from "./fakeFetch";

function mockMatchMedia(matching: string[]) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matching.includes(query),
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

const renderApp = () => render(<App fetchImpl={fakeFetch(() => jsonResponse([]))} />);

afterEach(() => vi.restoreAllMocks());

describe("light/dark switch", () => {
  it("follows the system first, then saves the choice", async () => {
    mockMatchMedia(["(prefers-color-scheme: light)"]);
    renderApp();
    expect(document.documentElement.dataset.mode).toBe("light");
    await userEvent.click(screen.getByRole("switch", { name: "Dark mode" }));
    expect(document.documentElement.dataset.mode).toBe("dark");
    expect(localStorage.getItem("lyricsfinder.v2.mode")).toBe('"dark"');
  });

  it("ignores a broken saved value", () => {
    localStorage.setItem("lyricsfinder.v2.mode", '"purple"');
    renderApp();
    expect(document.documentElement.dataset.mode).toBe("dark");
  });
});

describe("motion toggle", () => {
  it("is static by default and turns the sheen on", async () => {
    renderApp();
    const btn = screen.getByRole("button", { name: "Animated sheen" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.motion).toBe("off");
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.motion).toBe("on");
  });

  it("stays static when the system asks for reduced motion", () => {
    localStorage.setItem("lyricsfinder.v2.motion", '"animated"');
    mockMatchMedia(["(prefers-reduced-motion: reduce)"]);
    renderApp();
    expect(document.documentElement.dataset.motion).toBe("off");
    expect(screen.getByRole("button", { name: /Animated sheen/ })).toBeDisabled();
  });
});
