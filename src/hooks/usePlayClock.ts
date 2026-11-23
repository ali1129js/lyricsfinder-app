import { useCallback, useEffect, useRef, useState } from "react";

const TICK_MS = 100;

/**
 * A pretend playback clock (no audio). Time comes from Date.now() deltas, so
 * a slow tick never makes the clock drift.
 */
export function usePlayClock(duration: number) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const startedAt = useRef(0);
  const baseTime = useRef(0);

  useEffect(() => {
    if (!playing) return;
    startedAt.current = Date.now();
    const id = window.setInterval(() => {
      const t = baseTime.current + (Date.now() - startedAt.current) / 1000;
      if (t >= duration) {
        baseTime.current = duration;
        setTime(duration);
        setPlaying(false);
      } else setTime(t);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [playing, duration]);

  const play = useCallback(() => {
    if (baseTime.current >= duration) {
      baseTime.current = 0;
      setTime(0);
    }
    setPlaying(true);
  }, [duration]);

  const pause = useCallback(() => {
    setPlaying(false);
    setTime((t) => {
      baseTime.current = t;
      return t;
    });
  }, []);

  const seek = useCallback(
    (t: number) => {
      const clamped = Math.min(Math.max(0, t), duration);
      baseTime.current = clamped;
      startedAt.current = Date.now();
      setTime(clamped);
    },
    [duration],
  );

  return { time, playing, play, pause, seek };
}
