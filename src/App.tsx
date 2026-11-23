import { useCallback, useEffect, useMemo, useState } from "react";
import { useTrackSearch } from "./hooks/useTrackSearch";
import { useHashRoute } from "./hooks/useHashRoute";
import { usePreferences } from "./hooks/usePreferences";
import { useDebouncedSearch } from "./hooks/useDebouncedSearch";
import { useRecentSearches } from "./hooks/useRecentSearches";
import { KEYS, densitySchema, readStored, writeStored } from "./lib/storage";
import type { Density } from "./lib/storage";
import { RecentSearches } from "./components/RecentSearches";
import type { FetchLike } from "./api/lrclib";
import { SearchForm } from "./components/SearchForm";
import { ResultsList } from "./components/ResultsList";
import { LyricsPage } from "./components/LyricsPage";
import { HeaderControls } from "./components/HeaderControls";
import { ErrorMessage, Loading } from "./components/StatusMessage";

interface Props {
  fetchImpl?: FetchLike;
}

const NoteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </svg>
);

export function App({ fetchImpl }: Props) {
  const { state, search, reset } = useTrackSearch(fetchImpl);
  const route = useHashRoute();
  const prefs = usePreferences();
  const box = useDebouncedSearch(search, reset);
  const history = useRecentSearches();
  const [density, setDensityState] = useState<Density>(() =>
    readStored(KEYS.density, densitySchema, "comfortable"),
  );
  const setDensity = useCallback((d: Density) => {
    writeStored(KEYS.density, d);
    setDensityState(d);
  }, []);
  const doneQuery = state.status === "done" ? state.query : null;
  const addRecent = history.add;
  useEffect(() => {
    if (doneQuery) addRecent(doneQuery);
  }, [doneQuery, addRecent]);
  const known = useMemo(
    () =>
      route.page === "track" && state.status === "done"
        ? state.tracks.find((t) => t.id === route.id)
        : undefined,
    [route, state],
  );

  return (
    <div className="app">
      <header className="appbar sheen">
        <a className="brand" href="#/">
          <span className="logo">
            <NoteIcon />
          </span>
          <span>
            <span className="brand-title">Lyrics Finder</span>
            <span className="brand-sub">Song lyrics from lrclib.net</span>
          </span>
        </a>
        <span className="spacer" />
        <HeaderControls
          mode={prefs.mode}
          onMode={prefs.setMode}
          motion={prefs.motion}
          onMotion={prefs.setMotion}
          reducedMotion={prefs.reducedMotion}
        />
      </header>
      <main className="main">
        {route.page === "track" ? (
          <LyricsPage key={route.id} id={route.id} known={known} fetchImpl={fetchImpl} />
        ) : (
          <>
            <section className="card hero sheen">
              <h1 className="page-title">Find the words to any song</h1>
              <p className="lede">Search by title, artist or a line you remember.</p>
              <SearchForm
                value={box.input}
                onType={box.onType}
                onSubmit={() => box.runNow(box.input)}
              />
              <RecentSearches
                items={history.recent}
                onPick={box.runNow}
                onRemove={history.remove}
                onClear={history.clear}
              />
            </section>
            <div aria-live="polite" className="results-region">
              {state.status === "loading" && <Loading label="Searching lrclib.net…" />}
              {state.status === "error" && <ErrorMessage error={state.error} />}
              {state.status === "done" && (
                <ResultsList
                  tracks={state.tracks}
                  query={state.query}
                  density={density}
                  onDensity={setDensity}
                />
              )}
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
