import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CHROME, TEXT_PAIRS, contrast, mixHex } from "./chrome";
import type { TokenName } from "./chrome";

const css = readFileSync(resolve(process.cwd(), "src/styles/chrome.css"), "utf8");

function cssBlock(selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`missing ${selector}`);
  return css.slice(start, css.indexOf("}", start));
}

describe("chrome tokens", () => {
  for (const mode of ["light", "dark"] as const) {
    it(`${mode}: every text pair reaches WCAG AA (4.5:1)`, () => {
      const t = CHROME[mode];
      const failing = TEXT_PAIRS.filter(([fg, bg]) => contrast(t[fg], t[bg]) < 4.5).map(
        ([fg, bg]) => `${fg}/${bg} ${contrast(t[fg], t[bg]).toFixed(2)}`,
      );
      expect(failing).toEqual([]);
    });

    it(`${mode}: the CSS variables match the TypeScript tokens`, () => {
      const block = cssBlock(`html[data-mode="${mode}"]`).toLowerCase();
      for (const [name, value] of Object.entries(CHROME[mode]) as [TokenName, string][])
        expect(block).toContain(`--${name.toLowerCase()}: ${value.toLowerCase()};`);
    });
  }

  for (const mode of ["light", "dark"] as const) {
    it(`${mode}: the highlighted synced line stays readable`, () => {
      const t = CHROME[mode];
      const bg = mixHex(t.accent, t.surface2, 16);
      expect(contrast(t.text, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("mixes like CSS color-mix", () => {
    expect(mixHex("#000000", "#FFFFFF", 50)).toBe("#808080");
  });

  it("computes known ratios", () => {
    expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrast("#121A24", "#FAFCFE")).toBeCloseTo(17.03, 1);
  });
});
