import { z } from "zod";

export const KEYS = {
  mode: "lyricsfinder.v2.mode",
  motion: "lyricsfinder.v2.motion",
} as const;

export const modeSchema = z.enum(["light", "dark"]);
export const motionSchema = z.enum(["static", "animated"]);
export type Mode = z.infer<typeof modeSchema>;
export type Motion = z.infer<typeof motionSchema>;

/** Read a JSON value and validate it. Anything missing or invalid gives the fallback. */
export function readStored<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or a full quota: the setting just will not persist.
  }
}

export function removeStored(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function systemMode(): Mode {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
