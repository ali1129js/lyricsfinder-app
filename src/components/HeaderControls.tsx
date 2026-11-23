import type { Mode, Motion } from "../lib/storage";

const Sun = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const Moon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
  </svg>
);
const Wave = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
    <path d="M3 18c2-2 4-2 6 0M15 6c2-2 4-2 6 0" opacity=".55" />
  </svg>
);

interface Props {
  mode: Mode;
  onMode: (m: Mode) => void;
  motion: Motion;
  onMotion: (m: Motion) => void;
  reducedMotion: boolean;
}

export function HeaderControls({ mode, onMode, motion, onMotion, reducedMotion }: Props) {
  const dark = mode === "dark";
  const animated = !reducedMotion && motion === "animated";
  return (
    <div className="ctrls">
      <button
        type="button"
        className="scheme"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        title="Light / dark"
        onClick={() => onMode(dark ? "light" : "dark")}
      >
        <span className="i-sun">
          <Sun />
        </span>
        <span className="i-moon">
          <Moon />
        </span>
        <span className="knob">{dark ? <Moon /> : <Sun />}</span>
      </button>
      <button
        type="button"
        className="iconbtn motion-btn"
        aria-pressed={animated}
        aria-label={
          reducedMotion
            ? "Animated sheen (off: your system asks for reduced motion)"
            : "Animated sheen"
        }
        title={
          reducedMotion
            ? "Your system asks for reduced motion, so the sheen stays off"
            : "Motion: static by default, click for a slow metallic sheen"
        }
        disabled={reducedMotion}
        onClick={() => onMotion(animated ? "static" : "animated")}
      >
        <Wave />
      </button>
    </div>
  );
}
