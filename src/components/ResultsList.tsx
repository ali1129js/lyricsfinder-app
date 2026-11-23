import { formatDuration } from "../api/lrclib";
import type { Track } from "../api/lrclib";
import { trackHref } from "../hooks/useHashRoute";
import type { Density } from "../lib/storage";

interface Props {
  tracks: Track[];
  query: string;
  density: Density;
  onDensity: (d: Density) => void;
}

export function ResultsList({ tracks, query, density, onDensity }: Props) {
  const compact = density === "compact";
  return (
    <section className="card results" aria-labelledby="results-title">
      <div className="results-head">
        <h2 id="results-title" className="section-title">
          {tracks.length} {tracks.length === 1 ? "result" : "results"} for “{query.trim()}”
        </h2>
        <div role="group" aria-label="List density" className="seg">
          <button type="button" aria-pressed={!compact} onClick={() => onDensity("comfortable")}>
            Comfortable
          </button>
          <button type="button" aria-pressed={compact} onClick={() => onDensity("compact")}>
            Compact
          </button>
        </div>
      </div>
      <ul
        className={compact ? "result-list compact" : "result-list"}
        aria-labelledby="results-title"
      >
        {tracks.map((t) => (
          <li key={t.id}>
            <a className="result" href={trackHref(t.id)}>
              <span className="result-main">
                <span className="result-title">{t.trackName}</span>
                <span className="result-artist">{t.artistName}</span>
              </span>
              <span className="result-meta">
                {t.albumName && <span className="result-album">{t.albumName}</span>}
                <span className="result-time">{formatDuration(t.duration)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
