import type { Mode, Motion } from "../lib/storage";

/**
 * Mirror Chrome tokens (Ali's global style "chrome", 23.11.2026).
 * src/styles/chrome.css holds the same values as CSS variables;
 * theme.test.ts checks that both agree and that text pairs pass WCAG AA.
 */
export const CHROME = {
  light: {
    bg: "#E9EEF4",
    bg2: "#CCD6E2",
    surface: "#FAFCFE",
    surface2: "#EEF3F8",
    border: "#B6C3D2",
    text: "#121A24",
    muted: "#46556A",
    accent: "#1E6FD9",
    accentText: "#1A5FBB",
    m2: "#AFC1D6",
    m3: "#8FA4BC",
    onMetal: "#0E1520",
    s1: "#6B7A8C",
    s2: "#46536A",
    s3: "#2F3A4A",
    onSec: "#FFFFFF",
    info: "#7CC8E6",
    danger: "#F29494",
    onFill: "#10161C",
  },
  dark: {
    bg: "#0B0F14",
    bg2: "#18202A",
    surface: "#1A222C",
    surface2: "#11171E",
    border: "#3A4858",
    text: "#EEF3F8",
    muted: "#A3B1C2",
    accent: "#7FB2FF",
    accentText: "#9CC3FF",
    m2: "#AFC1D6",
    m3: "#8FA4BC",
    onMetal: "#0E1520",
    s1: "#56677A",
    s2: "#3B4859",
    s3: "#28323F",
    onSec: "#EEF3F8",
    info: "#74C2E2",
    danger: "#F28B8B",
    onFill: "#10161C",
  },
} as const satisfies Record<Mode, Record<string, string>>;

export type TokenName = keyof (typeof CHROME)["light"];

/** Text/background pairs the UI actually uses. Each must reach 4.5:1. */
export const TEXT_PAIRS: ReadonlyArray<readonly [TokenName, TokenName]> = [
  ["text", "bg"],
  ["text", "bg2"],
  ["text", "surface"],
  ["text", "surface2"],
  ["muted", "surface"],
  ["muted", "surface2"],
  ["muted", "bg"],
  ["muted", "bg2"],
  ["accentText", "surface"],
  ["accentText", "surface2"],
  ["onMetal", "m2"],
  ["onMetal", "m3"],
  ["onSec", "s2"],
  ["onSec", "s3"],
  ["onFill", "info"],
  ["onFill", "danger"],
];

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) throw new Error(`Not a #RRGGBB colour: ${hex}`);
  const n = parseInt(m[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export function applyMode(mode: Mode): void {
  document.documentElement.dataset.mode = mode;
  document.documentElement.style.colorScheme = mode;
}

export function applyMotion(motion: Motion): void {
  document.documentElement.dataset.motion = motion === "animated" ? "on" : "off";
}
