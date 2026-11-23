import { useEffect, useId, useRef, useState } from "react";

interface Props {
  initialQuery?: string;
  /** Called after the user pauses typing, and right away on submit. */
  onSearch: (query: string) => void;
  /** Called when the box is cleared. */
  onClear: () => void;
  debounceMs?: number;
}

export const MIN_AUTO_CHARS = 2;

export function SearchForm({ initialQuery = "", onSearch, onClear, debounceMs = 350 }: Props) {
  const [value, setValue] = useState(initialQuery);
  const inputId = useId();
  const typed = useRef(false);

  useEffect(() => {
    if (!typed.current) return;
    const q = value.trim();
    if (q.length === 0) {
      onClear();
      return;
    }
    if (q.length < MIN_AUTO_CHARS) return;
    const t = window.setTimeout(() => onSearch(q), debounceMs);
    return () => window.clearTimeout(t);
  }, [value, debounceMs, onSearch, onClear]);

  return (
    <form
      role="search"
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        typed.current = false;
        onSearch(value);
      }}
    >
      <label htmlFor={inputId} className="search-label">
        Song or artist
      </label>
      <div className="search-row">
        <input
          id={inputId}
          className="input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. Bohemian Rhapsody"
          value={value}
          onChange={(e) => {
            typed.current = true;
            setValue(e.target.value);
          }}
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </div>
    </form>
  );
}
