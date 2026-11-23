import { useMemo } from "react";
import { useTrackSearch } from "./hooks/useTrackSearch";
import { useHashRoute } from "./hooks/useHashRoute";
import type { FetchLike } from "./api/lrclib";
import { SearchForm } from "./components/SearchForm";
import { ResultsList } from "./components/ResultsList";
import { LyricsPage } from "./components/LyricsPage";
import { ErrorMessage, Loading } from "./components/StatusMessage";

interface Props {
  fetchImpl?: FetchLike;
}

export function App({ fetchImpl }: Props) {
  const { state, search, reset } = useTrackSearch(fetchImpl);
  const route = useHashRoute();
  const lastQuery = state.status === "idle" ? "" : state.query;
  const known = useMemo(
    () =>
      route.page === "track" && state.status === "done"
        ? state.tracks.find((t) => t.id === route.id)
        : undefined,
    [route, state],
  );

  return (
    <div className="app">
      <header className="appbar">
        <a className="brand" href="#/">
          Lyrics Finder
        </a>
      </header>
      <main className="main">
        {route.page === "track" ? (
          <LyricsPage key={route.id} id={route.id} known={known} fetchImpl={fetchImpl} />
        ) : (
          <>
            <h1 className="page-title">Find the words to any song</h1>
            <SearchForm initialQuery={lastQuery} onSearch={search} onClear={reset} />
            <div aria-live="polite" className="results-region">
              {state.status === "loading" && <Loading label="Searching lrclib.net…" />}
              {state.status === "error" && <ErrorMessage error={state.error} />}
              {state.status === "done" && <ResultsList tracks={state.tracks} query={state.query} />}
            </div>
          </>
        )}
      </main>
      <footer className="footer">
        Lyrics from <a href="https://lrclib.net">lrclib.net</a>. No account or API key needed.
      </footer>
    </div>
  );
}
