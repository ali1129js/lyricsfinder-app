import { useId } from "react";

interface Props {
  value: string;
  /** Every keystroke. The parent decides when to search. */
  onType: (value: string) => void;
  onSubmit: () => void;
}

export function SearchForm({ value, onType, onSubmit }: Props) {
  const inputId = useId();
  return (
    <form
      role="search"
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
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
          onChange={(e) => onType(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </div>
    </form>
  );
}
