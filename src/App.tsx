import { useTrackSearch } from "./hooks/useTrackSearch";
import type { FetchLike } from "./api/lrclib";
import { SearchForm } from "./components/SearchForm";
import { ResultsList } from "./components/ResultsList";
import { ErrorMessage, Loading } from "./components/StatusMessage";

interface Props {
  fetchImpl?: FetchLike;
}

export function App({ fetchImpl }: Props) {
  const { state, search, reset } = useTrackSearch(fetchImpl);

  return (
    <div className="app">
      <header className="appbar">
        <h1 className="brand">Lyrics Finder</h1>
      </header>
      <main className="main">
        <SearchForm onSearch={search} onClear={reset} />
        <div aria-live="polite" className="results-region">
          {state.status === "loading" && <Loading label="Searching lrclib.net…" />}
          {state.status === "error" && <ErrorMessage error={state.error} />}
          {state.status === "done" && <ResultsList tracks={state.tracks} query={state.query} />}
        </div>
      </main>
      <footer className="footer">
        Lyrics from <a href="https://lrclib.net">lrclib.net</a>. No account or API key needed.
      </footer>
    </div>
  );
}
