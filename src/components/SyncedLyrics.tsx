import { useEffect, useId, useRef } from "react";
import { formatDuration } from "../api/lrclib";
import type { SyncedLine } from "../lib/lyrics";
import { activeLineIndex } from "../lib/lyrics";
import { usePlayClock } from "../hooks/usePlayClock";

interface Props {
  lines: SyncedLine[];
  duration: number | null;
}

function reducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function SyncedLyrics({ lines, duration }: Props) {
  const last = lines[lines.length - 1]?.time ?? 0;
  const total = Math.max(duration ?? 0, last + 4);
  const clock = usePlayClock(total);
  const active = activeLineIndex(lines, clock.time);
  const activeRef = useRef<HTMLLIElement>(null);
  const sliderId = useId();

  useEffect(() => {
    if (!clock.playing || active < 0) return;
    activeRef.current?.scrollIntoView?.({
      block: "center",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }, [active, clock.playing]);

  return (
    <div className="synced">
      <div className="player card sheen" aria-label="Play along" role="group">
        <button
          type="button"
          className="btn btn-primary play-btn"
          onClick={clock.playing ? clock.pause : clock.play}
        >
          {clock.playing ? "Pause" : clock.time > 0 && clock.time < total ? "Resume" : "Play along"}
        </button>
        <label htmlFor={sliderId} className="visually-hidden">
          Position
        </label>
        <input
          id={sliderId}
          className="seek"
          type="range"
          min={0}
          max={Math.ceil(total)}
          step={0.5}
          value={clock.time}
          aria-valuetext={`${formatDuration(clock.time)} of ${formatDuration(total)}`}
          onChange={(e) => clock.seek(Number(e.target.value))}
        />
        <span className="clock" aria-hidden="true">
          {formatDuration(clock.time)} / {formatDuration(total)}
        </span>
        <p className="player-note">No audio: the clock runs so you can follow the timed lines.</p>
      </div>
      <ol className="synced-lines" aria-label="Timed lyrics">
        {lines.map((l, i) => (
          <li
            key={`${l.time}-${i}`}
            ref={i === active ? activeRef : undefined}
            className={i === active ? "line active" : i < active ? "line past" : "line"}
            aria-current={i === active ? "true" : undefined}
          >
            {l.text || "♪"}
          </li>
        ))}
      </ol>
    </div>
  );
}
