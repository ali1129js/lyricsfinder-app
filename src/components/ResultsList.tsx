import { formatDuration } from "../api/lrclib";
import type { Track } from "../api/lrclib";

interface Props {
  tracks: Track[];
  query: string;
}

export function ResultsList({ tracks, query }: Props) {
  return (
    <section className="card results" aria-labelledby="results-title">
      <h2 id="results-title" className="section-title">
        {tracks.length} {tracks.length === 1 ? "result" : "results"} for “{query.trim()}”
      </h2>
      <ul className="result-list">
        {tracks.map((t) => (
          <li key={t.id} className="result">
            <span className="result-main">
              <span className="result-title">{t.trackName}</span>
              <span className="result-artist">{t.artistName}</span>
            </span>
            <span className="result-meta">
              {t.albumName && <span className="result-album">{t.albumName}</span>}
              <span className="result-time">{formatDuration(t.duration)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
