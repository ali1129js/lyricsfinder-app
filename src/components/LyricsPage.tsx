import { useEffect, useRef } from "react";
import { formatDuration } from "../api/lrclib";
import type { FetchLike, Track } from "../api/lrclib";
import { useTrack } from "../hooks/useTrack";
import { lyricsView } from "../lib/lyrics";
import { CopyButton } from "./CopyButton";
import { ErrorMessage, Loading } from "./StatusMessage";

interface Props {
  id: number;
  known: Track | undefined;
  fetchImpl?: FetchLike | undefined;
}

export function LyricsPage({ id, known, fetchImpl }: Props) {
  const state = useTrack(id, known, fetchImpl);
  const heading = useRef<HTMLHeadingElement>(null);
  const loaded = state.status === "done";

  useEffect(() => {
    if (loaded) heading.current?.focus();
  }, [loaded, id]);

  return (
    <article className="lyrics-page">
      <a className="back-link" href="#/">
        ← Back to search
      </a>
      {state.status === "loading" && <Loading label="Loading lyrics…" />}
      {state.status === "error" && <ErrorMessage error={state.error} />}
      {state.status === "done" && <TrackLyrics track={state.track} headingRef={heading} />}
    </article>
  );
}

function TrackLyrics({
  track,
  headingRef,
}: {
  track: Track;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const view = lyricsView(track);
  const meta = [track.albumName, formatDuration(track.duration)].filter(Boolean).join(" · ");
  return (
    <section className="card lyrics-card">
      <header className="lyrics-head">
        <div>
          <h2 className="lyrics-title" tabIndex={-1} ref={headingRef}>
            {track.trackName}
          </h2>
          <p className="lyrics-artist">{track.artistName}</p>
          {meta && <p className="lyrics-meta">{meta}</p>}
        </div>
        {view.kind === "plain" && <CopyButton text={view.text} />}
      </header>
      {view.kind === "plain" && <pre className="lyrics-text">{view.text}</pre>}
      {view.kind === "instrumental" && (
        <p className="notice notice-info">This track is instrumental, so there are no lyrics.</p>
      )}
      {view.kind === "empty" && (
        <p className="notice notice-info">lrclib.net has this track but no lyrics for it yet.</p>
      )}
    </section>
  );
}
