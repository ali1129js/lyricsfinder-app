import { useCallback, useEffect, useState } from "react";
import {
  KEYS,
  modeSchema,
  motionSchema,
  readStored,
  systemMode,
  writeStored,
} from "../lib/storage";
import type { Mode, Motion } from "../lib/storage";
import { applyMode, applyMotion } from "../theme/chrome";

const REDUCE = "(prefers-reduced-motion: reduce)";

function prefersReduced(): boolean {
  return window.matchMedia?.(REDUCE).matches ?? false;
}

/** Light/dark and motion, saved in localStorage. Reduced motion always wins. */
export function usePreferences() {
  const [mode, setModeState] = useState<Mode>(() =>
    readStored(KEYS.mode, modeSchema, systemMode()),
  );
  const [motion, setMotionState] = useState<Motion>(() =>
    readStored(KEYS.motion, motionSchema, "static"),
  );
  const [reducedMotion, setReduced] = useState(prefersReduced);

  useEffect(() => {
    const mq = window.matchMedia?.(REDUCE);
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => applyMode(mode), [mode]);
  useEffect(() => applyMotion(reducedMotion ? "static" : motion), [motion, reducedMotion]);

  const setMode = useCallback((m: Mode) => {
    writeStored(KEYS.mode, m);
    setModeState(m);
  }, []);
  const setMotion = useCallback((m: Motion) => {
    writeStored(KEYS.motion, m);
    setMotionState(m);
  }, []);

  return { mode, setMode, motion, setMotion, reducedMotion };
}
